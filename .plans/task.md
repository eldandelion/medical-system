## Overview
This plan implements the "近期动态" (Recent Activity) feature on the Dashboard. It aggregates pending tasks and recent system events into a single timeline feed of up to 5 items, customized per user role, completely avoiding presentation strings in the backend and relying purely on typed enums.

## Requirements
- Expose `GET /api/dashboard/activity` returning `DashboardActivityFeedDto` with a maximum of 5 recent activities.
- Enforce strict typing with `ActivityType` enum.
- Implement role-specific activity aggregation in `DashboardService`.
- Frontend maps backend DTOs to localized `ActivityItem` configurations for presentation.

## Architecture Changes
- **DTOs**: `DashboardActivityDto.kt` defining `ActivityType` and the response wrapper.
- **Service**: `DashboardService.kt` orchestrating role-based lookups from multiple repositories.
- **Repositories**: Addition of `findTop5...` optimized query methods in relevant JPA repositories.
- **Frontend API**: `frontend/src/api/dashboard.ts` and React Query hook `useDashboardActivity.ts`.
- **UI Views**: Dashboard page components connected to the unified API.

## Implementation Steps

### Phase 1: Backend Domain & Data Access
1. **Create Activity DTOs** (File: backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt)
   - Action: Define `ActivityType` enum and `DashboardActivityDto`, `DashboardActivityFeedDto`.
   - Why: Establishes the API contract with strict enum typings, adhering to the 'no magic strings' backend rule.
   - Dependencies: None
   - Risk: Low

2. **Update JPA Repositories** (Files: backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralJpaRepository.kt, backend/src/main/kotlin/com/medicalsystem/backend/repository/NotificationJpaRepository.kt, backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentJpaRepository.kt, backend/src/main/kotlin/com/medicalsystem/backend/repository/UserJpaRepository.kt)
   - Action: Add role-specific, paginated, and timestamp-sorted queries (e.g., `findTop5ByStatusOrderByCreatedAtDesc`).
   - Why: Ensures performant data access fetching only the required 5 records directly from the database level.
   - Dependencies: None
   - Risk: Medium (verify JPQL/Criteria queries with test data)

### Phase 2: Backend Logic & Endpoints
3. **Implement Service Logic & Tests** (Files: backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt, backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt)
   - Action: Update `getRecentActivity(user: User)` to query the required repositories based on `user.role`, aggregate into a list, sort by timestamp descending, and return the top 5 `DashboardActivityDto` items. Implement TDD test cases for each role scenario.
   - Why: Core business logic to fulfill the cross-domain dashboard feed.
   - Dependencies: Steps 1 & 2
   - Risk: Medium

4. **Expose Activity Endpoint & Tests** (Files: backend/src/main/kotlin/com/medicalsystem/backend/controller/DashboardController.kt, backend/src/test/kotlin/com/medicalsystem/backend/controller/DashboardControllerTest.kt)
   - Action: Add `GET /api/dashboard/activity` route utilizing `DashboardService`.
   - Why: Exposes the aggregated feed to the frontend.
   - Dependencies: Step 3
   - Risk: Low

### Phase 3: Frontend API & Hooks
5. **Implement API Client and Mock Data** (Files: frontend/src/api/dashboard.ts, frontend/src/mocks/handlers.ts, frontend/src/mocks/data/dashboard.ts)
   - Action: Add `fetchRecentActivity(token: string)`. Add corresponding MSW endpoint that returns typed mock data representing `DashboardActivityFeedDto`.
   - Why: Sets up real fetching capability along with resilient fallback mocking for UI development.
   - Dependencies: Phase 2 API definition
   - Risk: Low

6. **Create Query Hook** (File: frontend/src/hooks/useDashboardActivity.ts)
   - Action: Create a React Query hook `useDashboardActivity` scoping the `queryKey` natively by `session.token`.
   - Why: Implements data fetching, auto-refetching, and respects authentication state.
   - Dependencies: Step 5
   - Risk: Low

### Phase 4: Frontend UI Integration
7. **Integrate Hook into Dashboards** (Files: frontend/src/pages/AdminPage.tsx, frontend/src/pages/DoctorPage.tsx, frontend/src/pages/HeadCouncillorPage.tsx, frontend/src/pages/StudentPage.tsx, frontend/src/pages/TeacherPage.tsx, frontend/src/pages/TrialAdminPage.tsx)
   - Action: Call `useDashboardActivity()`, map `DashboardActivityDto` to `ActivityItem` arrays (applying localization mappings mapped to `ActivityType`), and pass to `DashboardView` via the `activities` prop.
   - Why: Connects the raw domain enum payload to the user-facing localized Web Components UI.
   - Dependencies: Step 6
   - Risk: Medium (ensure no layout breakage occurs if data is empty or loading)

## Testing Strategy
- Unit tests: `DashboardServiceTest.kt` for asserting role-aggregation accuracy, `DashboardControllerTest.kt` for mapping and access controls.
- Integration tests: `frontend/src/hooks/useDashboardActivity.test.ts` (if applicable) for ensuring correct `session.token` behavior.
- E2E tests: Page load validations checking that `ActivityItem` displays correctly.

## Risks & Mitigations
- **Risk**: Returning disparate domain structures across different roles causes unparseable payloads.
  - Mitigation: Strict adherence to `DashboardActivityDto` and limiting mapping logic strictly to the frontend enum resolvers.
- **Risk**: Inefficient queries pulling large datasets into memory before trimming to 5.
  - Mitigation: Ensure `findTop5...` directly leverages database layer limits.

## Success Criteria
- [ ] Backend exposes `GET /api/dashboard/activity` without magic strings.
- [ ] Each role sees specifically tailored dashboard items matching their workflow.
- [ ] Mock environment robustly serves frontend needs when backend is inactive.
- [ ] Frontend successfully displays dynamic activity titles, relative times, and icons mapping to backend `ActivityType`.

## Writable Files
```text
Backend:
- backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt
- backend/src/main/kotlin/com/medicalsystem/backend/controller/DashboardController.kt
- backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt
- backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralJpaRepository.kt
- backend/src/main/kotlin/com/medicalsystem/backend/repository/NotificationJpaRepository.kt
- backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentJpaRepository.kt
- backend/src/main/kotlin/com/medicalsystem/backend/repository/UserJpaRepository.kt
- backend/src/test/kotlin/com/medicalsystem/backend/controller/DashboardControllerTest.kt
- backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt

Frontend:
- frontend/src/api/dashboard.ts
- frontend/src/hooks/useDashboardActivity.ts
- frontend/src/pages/AdminPage.tsx
- frontend/src/pages/DoctorPage.tsx
- frontend/src/pages/HeadCouncillorPage.tsx
- frontend/src/pages/StudentPage.tsx
- frontend/src/pages/TeacherPage.tsx
- frontend/src/pages/TrialAdminPage.tsx
- frontend/src/mocks/handlers.ts
- frontend/src/mocks/data/dashboard.ts
```
