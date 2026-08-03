# GEMINI.md

## Project Overview
The University Medical Screening System is a full-stack platform managing student health screenings, psychiatric triage, and hospital referral workflows across multiple roles (Student, Teacher, Head Councillor, Trial Admin, Doctor).

### Monorepo Structure
```text
/
├── frontend/             # React 19 + TypeScript + Vite single-page application
├── backend/              # Spring Boot + Kotlin REST API application
├── docker-compose.yml    # Container orchestration (MySQL 8, backend, frontend)
└── .github/workflows/    # Deployment workflows
```

---

## Tech Stack & Build Tools

### Frontend
- **Framework & Core**: React 19, TypeScript 5.8 (Target ES2022, bundler module resolution)
- **Build Tool & Dev Server**: Vite 6 (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite`), Material Design 3 Web Components (`@material/web`), Roboto fonts, Material Symbols
- **State & Data Fetching**: TanStack React Query 5 (`staleTime: 5m`, 3 retries), React Context API
- **Animations & Icons**: Motion (Framer Motion), Lucide React
- **API Mocking**: Mock Service Worker (MSW 2) in development/testing with backend fallback

### Backend & Database
- **Framework**: Spring Boot 4.1, Spring Data JPA, Spring Web, Spring Validation, SpringDoc OpenAPI 2.6
- **Language & Runtime**: Kotlin 2.3 (JVM 17), Jackson Kotlin Module
- **Build Tool**: Apache Maven (wrapper: `./mvnw`), Jacoco Maven Plugin
- **Database**: MySQL 8 (InnoDB), H2 (in-memory test database)
- **Deployment**: Docker & Docker Compose (`db:3306->3307`, `backend:8080->8081`, `frontend:80`)

---

## Architecture & Code Organization

### Frontend Architecture
- **Role-Based Orchestration**: `App.tsx` routes views according to the authenticated user's role.
- **Modular Component Tree**: `src/components/` organized by domain (`assessments`, `dashboard`, `records`, `students`, `profile`, `staff`, `creation-overlay`, `layout`, `common`).
- **Context-Driven UI State**: Contexts manage authentication (`AuthContext`), global snackbars (`SnackbarContext`), theme/dark mode, and creation flows.

### Backend Architecture (Domain-Driven Design)
- **`model/`**: Pure domain aggregates, entities, factories, visibility policies, and domain value objects. Business logic uses pure Kotlin `enum class` types.
- **`converter/`**: JPA `@Converter(autoApply = true)` implementations (`EnumConverters.kt`, `ValueObjectConverters.kt`) map domain enums to 1-based integer ordinals to keep database schemas optimized and decouple DB persistence from the domain.
- **`entity/`**: JPA entities mapped to MySQL tables with `BIGINT UNSIGNED` primary keys.
- **`repository/`**: Spring Data JPA repositories and custom adapter implementations.
- **`service/`**: Application and domain services handling business transactions and publishing domain events.
- **`controller/` & `dto/`**: REST controllers under `/api/*` consuming and returning strongly typed DTOs.
- **`security/`**: Token-resolving Servlet Filter (`MockAuthenticationFilter`) injecting authenticated users via `@CurrentUser` argument resolver (`CurrentUserArgumentResolver`).

---

## Coding Conventions & Formatting

### Naming Conventions
- **Classes, Interfaces, Types, React Components**: `PascalCase` (e.g., `ReferralController`, `StudentPage`, `NotificationDto`)
- **Functions, Methods, Variables, Properties**: `camelCase` (e.g., `fetchActiveReferrals`, `useReferralActions`, `studentNumber`)
- **Enums**: `PascalCase` for enum classes, `SCREAMING_SNAKE_CASE` for enum entries (e.g., `ReferralStatus.AWAITING_TRIAGE`)
- **Database Tables & Columns**: `snake_case` (e.g., `referral_step`, `student_id`)

### Formatting
- **Frontend**: 2-space indentation, semicolons enabled, single/double quotes, TypeScript strict type checking (`tsc --noEmit`).
- **Backend**: 4-space indentation, standard Kotlin coding conventions, trailing commas supported.

---

## Error Handling

### Frontend
- **API Requests**: Async `fetch` calls check `res.ok` and throw standard `Error` messages on failures.
- **User Feedback**: UI operations catch errors and display feedback via `useSnackbar()` notification alerts or fallback state indicators.
- **Mock Fallback**: MSW handlers attempt live backend communication and fall back to mock datasets on network or endpoint failures.

### Backend
- **Custom Exceptions**: Domain and HTTP exceptions extend `RuntimeException` (e.g., `NotFoundException`, `ConflictException`, `ValidationException`, `ForbiddenException`, `ReferralStateException`).
- **Centralized Handler**: `@RestControllerAdvice` in `GlobalExceptionHandler.kt` maps exceptions to uniform JSON responses:
  - Returns appropriate status codes (`400 BAD_REQUEST`, `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CONFLICT`).
  - Response body format: `{"error": "Message"}` or `{"error": "Validation failed", "details": {...}}` for bean validation errors (`MethodArgumentNotValidException`).

---

## Logging Practices

### Frontend
- Utilizes standard browser `console` methods:
  - `console.error`: For unexpected API failures and critical catch blocks.
  - `console.warn`: For missing references or MSW fallback triggers.
  - `console.log`: For UI state debugging in development.

### Backend
- Uses SLF4J with standard class-bound loggers:
  - `private val logger = LoggerFactory.getLogger(TargetClass::class.java)`
- Levels:
  - `logger.info`: For successful state transitions, event processing, and entity lifecycle completions.
  - `logger.warn`: For recoverable domain anomalies or parsing issues.
  - `logger.error`: For missing critical entities or service exceptions.

---

## Existing Testing Strategies

### Frontend Tests (Vitest + Testing Library)
- **Runner & Environment**: Vitest with `jsdom` test environment.
- **Frameworks**: `@testing-library/react` and `@testing-library/dom`.
- **Scope**:
  - Component unit and interaction tests (`*.test.tsx`) asserting DOM output and event firing via `fireEvent` / `screen`.
  - Utility and date formatting tests (`*.test.ts`).
  - MSW handler integration tests (`handlers.test.ts`).
  - Hook and Context behavior tests (`AuthContext.test.tsx`, `useReferralActions.test.tsx`).

### Backend Tests (JUnit 5 + Mockito Kotlin + Spring Boot Test)
- **Unit Testing**:
  - JUnit 5 (`@Test`) with Mockito Kotlin (`@ExtendWith(MockitoExtension::class)`).
  - Isolated testing of Controllers and Services with `@Mock` repositories/dependencies and `@InjectMocks`.
- **Integration & Repository Testing**:
  - `@SpringBootTest` with `@Transactional` and `@Autowired EntityManager` for repository query and entity mapping validation against H2 database.
- **Coverage**:
  - Jacoco Maven Plugin configured to measure code coverage during `mvn test`.

---

## MSW to Real API Migration & Contract Rules

1. **Strict Type Contracts (Zero `any` on API Responses)**:
   - Frontend API fetching hooks (`useQuery`, `fetch`) must NEVER type responses implicitly as `any`.
   - Always define explicit TypeScript interfaces mirroring the backend Kotlin DTOs (e.g. `DashboardResponseDto<T>`).
   - If a field is excluded or deferred on the backend, it must NOT exist on the frontend response type, ensuring TypeScript (`tsc --noEmit`) immediately flags any unmigrated UI references at compile time.

2. **Synchronize Mocks with Backend DTOs**:
   - When transitioning an endpoint from MSW to the backend, immediately prune or align MSW mock schemas (`src/mocks/data/*`) to match the exact JSON payload returned by the Spring Boot controller.
   - Never allow MSW mocks to return extra or phantom fields that the live backend does not provide.

3. **Defensive Rendering for Collections & Optional Fields**:
   - UI components rendering lists, nested objects, or optional DTO fields must always supply default fallbacks (e.g. `items = []`, `data?.list ?? []`) and use optional chaining (`items?.map(...)`).
   - Components must gracefully render empty or loading placeholder states when partial data is returned.

---

## Domain Policies & Aggregate Invariant Synchronization

1. **Actionable Status & Metric Alignment with Aggregate Invariants**:
   - Any domain status policy or metric query (e.g., `ReferralActionPolicy`) MUST be derived from or strictly synchronized with the Aggregate's executable actions (`Referral.getAllowedActions(user)`).
   - If a role has domain actions available in a state (e.g. `UserRole.DOCTOR` in `WAITING_FOR_SCHEDULING` for scheduling and `WAITING_FOR_APPOINTMENT` for feedback), that state must be explicitly included in the role's actionable policy.

---

## Persistence & JPA Specification Rules

1. **JPA Entity Property Fidelity & Criteria Specification Verification**:
   - Never assume entity identifier properties are named `id`. Role-extension entities (`DoctorEntity`, `TeacherEntity`, `TrialAdminEntity`, `HeadCounsellorEntity`) use `@Id val userId: Long` mapped to `user_id`.
   - Always verify exact Kotlin property names when composing JPA Criteria API predicates (`root.join(...).get("userId")`).
   - Every branch of a `JpaSpecification` (e.g. `ReferralJpaSpecification.fromVisibilityCriteria`) MUST be covered by an integration test (`@SpringBootTest`) against the test database to ensure criteria queries execute valid SQL without silent filtering bugs or attribute name errors.


---

## Common Development & Build Commands

### Frontend (`/frontend`)
- Install dependencies: `npm install`
- Start dev server (port 3000): `npm run dev`
- Run type check / lint: `npm run lint` (`tsc --noEmit`)
- Run unit tests: `npm run test` (`vitest`)
- Production build: `npm run build` (`vite build`)

### Backend (`/backend`)
- Run unit and integration tests: `./mvnw test`
- Build executable JAR: `./mvnw clean package`
- Run local development application: `./mvnw spring-boot:run`

### Full Stack via Docker
- Build and spin up all containers: `docker compose up --build -d`
- View container logs: `docker compose logs -f`
- Stop containers: `docker compose down`

---

## PRD and Context

- Located in folder .ai

## On-Demand Context

<!-- Optional: Reference docs for deeper context -->

| Topic | File |
|-------|------|
| Repository Architecture & Domain Map | `project-index.md` |
| Frontend UI Architecture & Components | `.ai/reference/components.md` |
| Frontend API Client & State Management | `.ai/reference/frontend-api-state.md` |
| Backend Data Architecture & Persistence | `.ai/reference/backend-data.md` |
| Backend Services & Domain Logic | `.ai/reference/backend-services.md` |
| Security, Authentication, & Error Handling | `.ai/reference/security-errors.md` |

