# GEMINI.md - Project Context Summary

## Project Overview
**Name**: University Medical Screening System (Full Stack)
**Purpose**: A comprehensive medical screening and referral management system for universities, supporting multiple user roles (Student, Teacher, Head Councillor, Admin, Doctors).

## Technology Stack
### Frontend
- **Core**: [React 19](https://react.dev/) (Functional Components, Hooks)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 6](https://vitejs.dev/)
- **Styling**: Tailwind CSS 4, Material Design 3 (Material Web Components), Custom CSS variables
- **Libraries**: Motion (Framer Motion), Recharts, @google/genai

### Backend & Infrastructure
- **Core**: [Spring Boot](https://spring.io/projects/spring-boot)
- **Language**: [Kotlin](https://kotlinlang.org/)
- **Data Access**: Spring Data JPA / Hibernate
- **Database**: MySQL 8
- **Infrastructure**: Docker & Docker Compose

## Architecture & Design Patterns
- **Frontend Architecture**: 
  - Role-Based Orchestration (`App.tsx` routes to `StudentPage`, `TeacherPage`, etc.)
  - Domain-organized components (`components/records`, `components/students`, etc.)
- **Backend Architecture (Domain-Driven Design)**:
  - **Pure Domain Models**: Business logic strictly uses pure Kotlin `enum class` and rich domain types.
  - **Infrastructure Isolation**: JPA `@AttributeConverter` is utilized to map complex domain types (like enums) to highly optimized database structures (e.g., standard integers) without polluting the Domain layer.
  - **Security Architecture (Black Box)**: Authentication is completely decoupled from controllers and business logic. A Servlet Filter resolves tokens and injects the authenticated entity via a `@CurrentUser` argument resolver. This mock security layer is designed as a drop-in replacement for future Spring Security (JWT) integration.
- **Database Standards**:
  - Uses `BIGINT UNSIGNED` / `INT UNSIGNED` for primary and foreign keys.
  - Strictly avoids MySQL native `ENUM` types in favor of integer-backed application lookups or dedicated lookup tables.
  - Strategically uses composite indexes for common query patterns (e.g., `idx_referral_student_status`).

## Installed Agent Skills & Best Practices
1. **Test-Driven Development (TDD)**:
   - **The Iron Law**: NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST.
   - Always Red -> Green -> Refactor. 
2. **MySQL Expertise**:
   - Focuses on highly optimized schemas, covering indexes, and avoiding technical debt (like native Enums).
3. **Domain-Driven Design (DDD)**:
   - Maintains ubiquitous language and bounded contexts.
4. **Clean Code**:
   - High standards for readability, small focused methods, and maintainability.

## Directory Structure
```text
/
├── frontend/             # Vite React Application
│   ├── src/              # React source code (components, pages, contexts)
│   ├── public/           # Static assets
│   └── package.json      # Frontend dependencies
├── backend/              # Spring Boot Kotlin Application
│   ├── src/main/kotlin/  # Kotlin source code (controllers, services, models, entities, converters)
│   ├── src/test/kotlin/  # TDD Test Suite
│   └── pom.xml           # Maven dependencies
├── .agent/skills/        # AI Agent Skills (TDD, MySQL, DDD, Clean Code)
└── docker-compose.yml    # Deployment orchestration (db, frontend, backend)
```

## Coding Conventions
- **Git Workflow**: Always checkout to a new branch when implementing a new feature or fixing a bug.
- **Component Structure (React)**: Always use Functional Components with Hooks.
- **Naming**:
  - React Components/Types: `PascalCase`
  - Kotlin Classes/Entities: `PascalCase`
  - Utilities/Functions/Variables: `camelCase`
- **Testing**: Tests must accurately reflect the behavior of the new services/controllers, using strict mock verification.
