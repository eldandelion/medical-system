# Implementation Plan: Recent Activity Feature (Dashboard)

## Overview
Implement the complete "近期动态" (Recent Activity) feature across the Dashboard for all roles. The plan involves strictly aligning the backend API with the `architecture.md` specification, extracting magic strings into a centralized frontend UI mapper, and populating the data efficiently per role.

## Requirements
- Synchronize `ActivityType` enum with the exact specification in `architecture.md`.
- Implement data aggregation in `DashboardService.kt` for each of the 6 roles, sorting activities by `timestamp` descending.
- Utilize a centralized mapper in the frontend to translate `ActivityType` into localized Material Design UI components without relying on backend strings.
- Pass the mapped activities into `DashboardView` across all role pages.

## Architecture Changes
- Backend DTO: `DashboardActivityDto.kt` needs `ActivityType` updated.
- Backend Service: `DashboardService.kt` requires querying multiple repositories and assembling the lists per role.
- Frontend Config/Utils: `src/utils/activityMapper.ts` (new) will encapsulate the conversion of `ActivityType` to localized UI details.
- Frontend UI: Update `*Page.tsx` dashboards to use the centralized UI mapper instead of inline formatting.

## Implementation Steps

### Phase 1: Backend DTO & Service Synchronization (3 files)
1. **Update ActivityType Enum** (File: `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`)
   - Action: Update `ActivityType` enum to match the 10 values exactly as outlined in `architecture.md` (e.g. `REFERRAL_STATUS_UPDATED`, `HIGH_RISK_ASSESSMENT_SUBMITTED`, etc.).
   - Why: Ensures contract parity between architecture, backend, and frontend.
   - Dependencies: None
   - Risk: Low

2. **Implement Role Aggregation Logic** (File: `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`)
   - Action: In `getRecentActivity(user)`, query appropriate repositories (`notificationJpaRepository`, `assessmentAssignmentRepository`, `referralJpaRepository`) according to the queries specified in `architecture.md` for each role. Note: For `HIGH_RISK_ASSESSMENT_SUBMITTED`, query `notificationJpaRepository` for relevant `NotificationMessageCode` (like `ASSESSMENT_COMPLETED_TEACHER` or `ASSESSMENT_HIGH_RISK_ALERT_HC`). Merge, sort by timestamp DESC, and limit to top 5.
   - Why: Core feature requirement to populate dashboard feed.
   - Dependencies: Step 1
   - Risk: Medium (complex querying and mapping required)

3. **Add Service Tests** (File: `backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`)
   - Action: Add/update unit test cases validating the aggregation and correct return of top 5 activities for a subset of roles (e.g., Student and Teacher).
   - Why: Regression prevention.
   - Dependencies: Step 2
   - Risk: Low

### Phase 2: Frontend Data Contract & UI Mapping (3 files)
4. **Update Frontend API Contract** (File: `frontend/src/api/dashboard.ts`)
   - Action: Update `ActivityType` type to match the new backend enum exactly.
   - Why: Resolves TypeScript compilation checks.
   - Dependencies: Step 1
   - Risk: Low

5. **Update MSW Mocks** (File: `frontend/src/mocks/data/dashboard.ts`)
   - Action: Ensure `mockDashboardActivities` includes appropriate dummy data matching the newly updated `ActivityType` enum across different roles.
   - Why: Required to support offline/local development without backend connectivity.
   - Dependencies: Step 4
   - Risk: Low

6. **Create Activity UI Mapper** (File: `frontend/src/utils/activityMapper.ts`)
   - Action: Create and export a function `mapActivityTypeToUI(activity: DashboardActivityDto)` returning an object with `{ title: string, statusText: string, statusType: ActivityStatusType }`. Map all 10 `ActivityType` enum values to localized text strings that align with Material Design specs (e.g. error, info, neutral).
   - Why: Replaces hardcoded UI text logic in the view pages and enforces localization without relying on backend presentation strings.
   - Dependencies: Step 4
   - Risk: Low

### Phase 3: Connect Frontend Views (6 files)
7. **Integrate Mapper into Dashboards** (Files: `frontend/src/pages/StudentPage.tsx`, `frontend/src/pages/TeacherPage.tsx`, `frontend/src/pages/HeadCouncillorPage.tsx`, `frontend/src/pages/TrialAdminPage.tsx`, `frontend/src/pages/DoctorPage.tsx`, `frontend/src/pages/AdminPage.tsx`)
   - Action: Import `mapActivityTypeToUI` and replace the inline `activities` `.map()` logic passed to `DashboardView` with this new function.
   - Why: Rollout mapped changes across all role dashboards and keeps code DRY.
   - Dependencies: Step 6
   - Risk: Low

## Testing Strategy
- Unit Tests: Test the logic of `DashboardService.getRecentActivity` ensuring max 5 items are fetched, sorted properly, and mapped correctly from repository entities.
- Typescript Check: Ensure no compilation errors (`npm run lint` / `tsc --noEmit`) post mapper integration.
- MSW Verification: Render the React components with MSW providing the updated mock datasets.

## Writable Files
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`
- `frontend/src/api/dashboard.ts`
- `frontend/src/mocks/data/dashboard.ts`
- `frontend/src/utils/activityMapper.ts`
- `frontend/src/pages/StudentPage.tsx`
- `frontend/src/pages/TeacherPage.tsx`
- `frontend/src/pages/HeadCouncillorPage.tsx`
- `frontend/src/pages/TrialAdminPage.tsx`
- `frontend/src/pages/DoctorPage.tsx`
- `frontend/src/pages/AdminPage.tsx`
