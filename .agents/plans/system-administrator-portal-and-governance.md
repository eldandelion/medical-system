# Feature: System Administrator Portal & Governance Subsystem

The following plan provides an end-to-end, context-rich implementation blueprint for introducing the 6th role (`UserRole.SYSTEM_ADMIN`) and building the full Administrator Portal (`AdminPage.tsx`) in the University Medical Screening System.

---

## Executive Architectural Summary & Review Reconciliation

This plan has been reviewed and hardened by two specialized architectural quality gates:
- **Domain-Driven Design (DDD) Review**: Identified bounded context decoupling, aggregate consistency boundaries, domain step logging on administrative interventions, graceful in-flight assessment completion upon scale deprecation, and soft-delete user state machine preserving medical audit trails.
- **Clean Code & Quality Review**: Identified Single Responsibility Principle (SRP) service separation (`UserManagementService` vs `ReferralService`), criteria query optimizations for multi-role filtering, optimistic concurrency locking, type-safe API contracts with zero `any` types, and strict MSW mock schema synchronization.

### Reconciliation & Design Decisions

| Finding | Source | Resolution / Decision |
|---|---|---|
| **Service Boundaries (SRP)** | Clean Code | Create dedicated `UserManagementService` & `AdminUserController` for account status transitions (`/api/admin/users/**`). Referral overrides remain in `ReferralService`, assessment catalog toggles in `AssessmentService`, and metrics in `DashboardService`. |
| **Account Lifecycle & Soft-Delete** | DDD & Clean Code | Add `AccountStatus` (`PENDING_APPROVAL`, `ACTIVE`, `DISABLED`, `DELETED`) and `deleted_at` to `UserEntity`. User deletion is strictly a Soft Delete (`status = DELETED`), keeping user IDs intact for historical referrals and appointments. |
| **Referral Fatal Cancellation** | Product & DDD | Add `CANCEL_REFERRAL` to `ReferralAction`. Admin can execute fatal cancellation on any referral at any stage, transitioning it to `CLOSED` (or cancelled) and recording a `ReferralStep` with `actorId = admin.id` and justification `reason`. |
| **Assessment Scale Availability** | DDD & Clean Code | Persist scale availability (`isEnabled: Boolean`) in the database (`assessment_scale_settings`). Hiding a scale prevents new assignments while allowing students with pending in-flight assignments to complete them (Grace Period). |
| **Language-Agnostic Backend Contracts** | Project Rule (`GEMINI.md`) | DTOs return status enums, booleans, and IDs with zero hardcoded presentation strings. The frontend determines all localized UI text. |
| **Auth & React Query Scoping** | Frontend Architecture | Update `AuthContext` with `'admin'` role and token. All React Query hooks include `session.token` in `queryKey` to trigger immediate invalidation on role changes. |

---

## Feature Description

Implement a comprehensive Administrator Portal (`AdminPage.tsx`) powered by `UserRole.SYSTEM_ADMIN` (`admin` in frontend) that provides:
1. **User Account Governance**: Multi-role user directory (Students, Teachers, Head Councillors, Trial Admins, Doctors) with status filtering (`Pending Approval`, `Active`, `Disabled`, `Deleted`), one-click account approvals, account activation/deactivation, and soft deletion.
2. **Referral Lifecycle Governance**: Unrestricted oversight of all referrals in the platform, direct multi-stage approvals, and fatal cancellation (`CANCELLED`) with audit justification.
3. **Assessment Catalog Management**: Real-time questionnaire availability toggles (`md-switch`), preventing new student intakes/assignments while honoring in-flight submissions.
4. **System Metrics Dashboard**: Platform-wide operational overview displaying total registered users by role, pending account approvals queue, active referral funnel breakdown, and completed assessment metrics.
5. **Standard Material 3 Layout**: Reusable integration with `Sidebar`, `CanvasHeader`, `MainContent`, `DetailsPanel`, and role switcher.

## User Story

```text
As a System Administrator
I want to approve pending staff/doctor accounts, manage active user statuses, oversee and override referrals, and toggle questionnaire availability
So that the university platform operates securely, compliantly, and with transparent administrative governance across all colleges and hospitals.
```

## Feature Metadata

- **Feature Type**: New Capability & Governance Subsystem
- **Estimated Complexity**: High
- **Primary Systems Affected**: `UserEntity`, `UserManagementService`, `AdminUserController`, `Referral`, `ReferralService`, `AssessmentService`, `DashboardService`, `AdminPage.tsx`, `UserManagementView.tsx`, `AssessmentCatalogManagementView.tsx`, `AuthContext.tsx`, `handlers.ts`
- **Dependencies**: Spring Boot 4.1, Kotlin 2.3, JPA / MySQL 8, React 19, Material Web Components (`@material/web`), TanStack React Query 5

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- [`backend/src/main/kotlin/com/medicalsystem/backend/model/UserRole.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/UserRole.kt#L1-L11) - Enum defining `SYSTEM_ADMIN`.
- [`backend/src/main/kotlin/com/medicalsystem/backend/entity/UserEntity.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/entity/UserEntity.kt#L1-L23) - Base user entity to add `status` and `deletedAt`.
- [`backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt#L1-L30) - Pattern for `@Converter(autoApply = true)` JPA mappings.
- [`backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt#L100-L150) - `getAllowedActions` and status transition logic on Aggregate Root.
- [`backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralAction.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralAction.kt#L1-L19) - Referral actions enum.
- [`backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralActionPolicy.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralActionPolicy.kt#L1-L20) - Actionable status mapping per role.
- [`backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt#L30-L75) - Catalog loading and assignment validation.
- [`backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt#L30-L70) - Role metrics aggregation pattern.
- [`frontend/src/pages/TrialAdminPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/TrialAdminPage.tsx#L1-L150) - Canonical template for portal pages with sidebar and details panel.
- [`frontend/src/contexts/AuthContext.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/AuthContext.tsx#L1-L80) - Role switching and token management.
- [`frontend/src/config/dashboardConfig.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/config/dashboardConfig.ts#L1-L60) - Metric widget definitions.
- [`frontend/src/mocks/handlers.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/mocks/handlers.ts#L1-L60) - MSW request interception pattern.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/model/AccountStatus.kt` - Account status enum (`PENDING_APPROVAL`, `ACTIVE`, `DISABLED`, `DELETED`).
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentScaleSettingEntity.kt` - Scale availability persistence entity.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentScaleSettingJpaRepository.kt` - JPA repository for scale availability settings.
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/AdminUserDto.kt` - User management DTOs (`AdminUserSummaryDto`, `UpdateAccountStatusRequest`, `AdminMetricsDto`).
- `backend/src/main/kotlin/com/medicalsystem/backend/service/UserManagementService.kt` - Application service for user lifecycle and filtering.
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/AdminUserController.kt` - REST controller for `/api/admin/users/**`.
- `backend/src/test/kotlin/com/medicalsystem/backend/service/UserManagementServiceTest.kt` - Unit tests for user status transitions and filtering.
- `backend/src/test/kotlin/com/medicalsystem/backend/controller/AdminUserControllerTest.kt` - Controller integration tests with auth checks.
- `frontend/src/pages/AdminPage.tsx` - Full Administrator single-page workspace view.
- `frontend/src/components/admin/UserManagementView.tsx` - Multi-role filterable user table with status action buttons.
- `frontend/src/components/admin/UserDetailsView.tsx` - Detailed user audit and account status details panel.
- `frontend/src/components/admin/AssessmentCatalogManagementView.tsx` - Catalog list with availability switches.
- `frontend/src/api/admin.ts` - Frontend API client methods for admin endpoints.

---

## Patterns to Follow

### Backend Patterns
- **Entity Identification**: `@Id val userId: Long` mapped to `user_id` for role extensions, `@Id @GeneratedValue val id: Long` on base entities.
- **Language-Agnostic DTOs**: Never return localized text from Kotlin DTOs.
- **Converters**: Implement `@Converter(autoApply = true)` for all domain enums.
- **Security Context**: Inject `@CurrentUser user: User` via `CurrentUserArgumentResolver`. Check `user.role == UserRole.SYSTEM_ADMIN` or throw `ForbiddenException`.

### Frontend Patterns
- **Role Scoping in React Query**: Always include `session.token` in `queryKey: ['/api/admin/users', session.token]`.
- **Defensive Rendering**: Always supply fallbacks (`users ?? []`) and use optional chaining.
- **Material 3 Theming**: Use CSS variables for container colors (e.g. `bg-[var(--md-sys-color-surface-container-highest)]`).

---

## STEP-BY-STEP IMPLEMENTATION TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Phase 0: Workspace & Git Branch Setup

#### Task 0: CREATE and SWITCH to New Git Feature Branch
- **IMPLEMENT**: Create and checkout a clean feature branch `feature/system-admin-portal` from `main` before performing any code modifications.
- **COMMAND**: `git checkout -b feature/system-admin-portal`
- **VALIDATE**: `git branch --show-current` (Must output `feature/system-admin-portal`)

---

### Phase 1: Backend Domain & Persistence Foundations

#### Task 1: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AccountStatus.kt`
- **IMPLEMENT**: Define domain enum:
  ```kotlin
  package com.medicalsystem.backend.model
  enum class AccountStatus {
      PENDING_APPROVAL,
      ACTIVE,
      DISABLED,
      DELETED
  }
  ```
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt`
- **VALIDATE**: `./mvnw compile -q`

#### Task 2: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt`
- **IMPLEMENT**: Add `AccountStatusConverter`:
  ```kotlin
  @Converter(autoApply = true)
  class AccountStatusConverter : AttributeConverter<AccountStatus, Int> {
      override fun convertToDatabaseColumn(attribute: AccountStatus?) = getIdFromEnum(attribute)
      override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<AccountStatus>(dbData)
  }
  ```
- **PATTERN**: `EnumConverters.kt:17-21`
- **VALIDATE**: `./mvnw test-compile -q`

#### Task 3: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/UserEntity.kt` & `User.kt`
- **IMPLEMENT**:
  1. In `UserEntity.kt`, add `@Column(nullable = false) var status: AccountStatus = AccountStatus.ACTIVE` and `@Column(name = "deleted_at") var deletedAt: java.time.Instant? = null`.
  2. In `User.kt`, add `val status: AccountStatus = AccountStatus.ACTIVE` and `val deletedAt: java.time.Instant? = null`.
- **PATTERN**: `UserEntity.kt:10-22`
- **VALIDATE**: `./mvnw compile -q`

#### Task 4: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentScaleSettingEntity.kt` & Repository
- **IMPLEMENT**:
  1. Entity `AssessmentScaleSettingEntity(@Id val batteryCode: String, @Column(nullable = false) var isAvailable: Boolean = true, @Column(name = "updated_at") var updatedAt: java.time.Instant = java.time.Instant.now())`.
  2. `AssessmentScaleSettingJpaRepository : JpaRepository<AssessmentScaleSettingEntity, String>`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/entity/MajorEntity.kt`
- **VALIDATE**: `./mvnw compile -q`

---

### Phase 2: Core Backend Services & APIs

#### Task 5: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/AdminUserDto.kt`
- **IMPLEMENT**:
  ```kotlin
  package com.medicalsystem.backend.dto
  import com.medicalsystem.backend.model.AccountStatus
  import com.medicalsystem.backend.model.UserRole
  import java.time.Instant

  data class AdminUserSummaryDto(
      val id: Long,
      val name: String,
      val email: String,
      val role: UserRole,
      val status: AccountStatus,
      val employeeOrStudentId: String? = null,
      val departmentOrCollege: String? = null,
      val hospital: String? = null,
      val deletedAt: Instant? = null
  )

  data class UpdateAccountStatusRequest(
      val status: AccountStatus,
      val reason: String? = null
  )

  data class ToggleScaleAvailabilityRequest(
      val isAvailable: Boolean
  )

  data class AdminMetricsDto(
      val totalUsersCount: Long = 0,
      val pendingApprovalsCount: Long = 0,
      val activeReferralsCount: Long = 0,
      val completedAssessmentsCount: Long = 0
  ) : DashboardMetricsDto
  ```
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardDto.kt`
- **VALIDATE**: `./mvnw compile -q`

#### Task 6: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/service/UserManagementService.kt`
- **IMPLEMENT**:
  1. `getUsers(role: UserRole?, status: AccountStatus?, keyword: String?, user: User): List<AdminUserSummaryDto>`: Validates `user.role == UserRole.SYSTEM_ADMIN`, queries `UserJpaRepository` and enriches with department/student/doctor metadata.
  2. `updateUserStatus(targetUserId: Long, newStatus: AccountStatus, reason: String?, adminUser: User): AdminUserSummaryDto`: Updates user status, sets `deletedAt = Instant.now()` if `newStatus == DELETED`, clears `deletedAt` if reactivated.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentService.kt`
- **VALIDATE**: `./mvnw compile -q`

#### Task 7: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/controller/AdminUserController.kt`
- **IMPLEMENT**:
  - `@GetMapping("/api/admin/users")`: Returns list of users with query params `role`, `status`, `keyword`.
  - `@PutMapping("/api/admin/users/{id}/status")`: Updates account status.
  - `@DeleteMapping("/api/admin/users/{id}")`: Soft-deletes user (`status = DELETED`).
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/controller/StudentController.kt`
- **VALIDATE**: `./mvnw compile -q`

#### Task 8: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralAction.kt`, `Referral.kt`, & `ReferralService.kt`
- **IMPLEMENT**:
  1. In `ReferralAction.kt`, add `CANCEL_REFERRAL`.
  2. In `Referral.kt`:
     - In `getAllowedActions(user)`: Add `CANCEL_REFERRAL` for `UserRole.SYSTEM_ADMIN` across active statuses.
     - Add `fun adminCancel(actor: User, reason: String)`: Transitions referral status to `ReferralStatus.CLOSED`, logs a `ReferralStep` with `actorId = actor.id` and `reason = "[ADMIN CANCEL] $reason"`.
  3. In `ReferralService.kt`: Add `fun cancelReferralByAdmin(referralId: Long, reason: String, adminUser: User): ReferralDetailsDto`.
  4. In `ReferralController.kt`: Add `@PostMapping("/{id}/cancel")`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/service/ReferralService.kt:180-220`
- **VALIDATE**: `./mvnw test -Dtest=ReferralTest`

#### Task 9: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt` & `AssessmentController.kt`
- **IMPLEMENT**:
  1. In `AssessmentService.kt`:
     - Inject `AssessmentScaleSettingJpaRepository`.
     - In `getCatalog()`: Merge static scales with setting repository to populate `isEnabled`.
     - In `assignToStudent` and `assignToCohort`: Verify scale is available, throwing `ValidationException` if disabled.
     - Add `fun toggleScaleAvailability(batteryCode: String, isAvailable: Boolean, adminUser: User)`.
  2. In `AssessmentController.kt`: Add `@PutMapping("/catalog/{batteryCode}/availability")`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt:60-120`
- **VALIDATE**: `./mvnw test -Dtest=AssessmentServiceTest`

#### Task 10: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt` & `DashboardController.kt`
- **IMPLEMENT**:
  1. In `DashboardService.kt`:
     - Add `fun getAdminProfile(user: User): ProfileSummaryDto`.
     - Add `fun getAdminDashboard(user: User): DashboardResponseDto<AdminMetricsDto>`.
  2. In `DashboardController.kt`:
     - Add `@GetMapping("/admin/profile")`.
     - Add `@GetMapping("/admin")`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt:60-100`
- **VALIDATE**: `./mvnw test -Dtest=DashboardServiceTest`

#### Task 11: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/security/MockAuthenticationFilter.kt` & `DataInitializer.kt`
- **IMPLEMENT**:
  1. In `MockAuthenticationFilter.kt`: Map `token.contains("admin")` to user with `role = UserRole.SYSTEM_ADMIN`.
  2. In `DataInitializer.kt`: Initialize a default System Admin user (`name = "系统管理员"`, `role = UserRole.SYSTEM_ADMIN`, `status = AccountStatus.ACTIVE`), and add 2 sample `PENDING_APPROVAL` staff/doctors for testing.
- **PATTERN**: `MockAuthenticationFilter.kt:35-55`
- **VALIDATE**: `./mvnw test`

---

### Phase 3: Frontend Types, Auth Context & API Client

#### Task 12: UPDATE `frontend/src/types/index.ts`
- **IMPLEMENT**:
  1. Update `Role = 'student' | 'teacher' | 'head-councillor' | 'trial-admin' | 'doctor' | 'admin'`.
  2. Add `export type AccountStatus = 'PENDING_APPROVAL' | 'ACTIVE' | 'DISABLED' | 'DELETED';`.
  3. Add `AdminUserSummaryDto`, `AdminMetricsDto`, `UpdateAccountStatusRequest`.
  4. Add `'cancel_referral'` to `ReferralAction`.
  5. Add `isEnabled?: boolean` to `AssessmentCatalogItemDto`.
- **PATTERN**: `frontend/src/types/index.ts:1-50`
- **VALIDATE**: `npm run lint`

#### Task 13: CREATE `frontend/src/api/admin.ts`
- **IMPLEMENT**:
  - `fetchAdminUsers(token, params)`
  - `updateAccountStatus(token, userId, status, reason)`
  - `toggleAssessmentAvailability(token, batteryCode, isAvailable)`
  - `cancelReferralByAdmin(token, referralId, reason)`
- **PATTERN**: `frontend/src/api/notifications.ts`
- **VALIDATE**: `npm run lint`

#### Task 14: UPDATE `frontend/src/contexts/AuthContext.tsx`
- **IMPLEMENT**:
  - Add `'admin'` to `session` mapping with `mock_admin_token` and user name `"系统管理员"`.
- **PATTERN**: `frontend/src/contexts/AuthContext.tsx:30-70`
- **VALIDATE**: `npx vitest run src/contexts/AuthContext.test.tsx`

#### Task 15: UPDATE `frontend/src/config/dashboardConfig.ts`, `styleConstants.ts`, & `roleTranslations.ts`
- **IMPLEMENT**:
  - Add `ADMIN_METRICS_CONFIG`.
  - Add Chinese translations for `admin` (`系统管理员`) and `AccountStatus` (`待审核`, `正常`, `已禁用`, `已注销`).
- **PATTERN**: `frontend/src/config/dashboardConfig.ts:40-60`
- **VALIDATE**: `npm run lint`

---

### Phase 4: Frontend Admin Views & Components

#### Task 16: CREATE `frontend/src/components/admin/UserManagementView.tsx`
- **IMPLEMENT**:
  - Role filter tabs: All, Students, Teachers, Head Councillors, Trial Admins, Doctors.
  - Status filter chips: All, Pending Approval (`待审核`), Active (`正常`), Disabled (`已禁用`), Deleted (`已注销`).
  - Search input for real-time name/email/ID filtering.
  - DataTable with status badges and action buttons:
    - `PENDING_APPROVAL`: "批准" (Approve), "拒绝" (Reject/Delete).
    - `ACTIVE`: "禁用" (Disable), "注销" (Delete).
    - `DISABLED`: "启用" (Enable), "注销" (Delete).
  - Emits `onUserSelect` when clicking row to open `DetailsPanel`.
- **PATTERN**: `frontend/src/components/staff/StaffManagementView.tsx`
- **VALIDATE**: `npm run lint`

#### Task 17: CREATE `frontend/src/components/admin/UserDetailsView.tsx`
- **IMPLEMENT**:
  - Renders user account information, role details, status history, and action buttons in `DetailsPanel`.
- **PATTERN**: `frontend/src/components/staff/StaffDetailsView.tsx`
- **VALIDATE**: `npm run lint`

#### Task 18: CREATE `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
- **IMPLEMENT**:
  - Renders list of catalog questionnaires (PHQ-9, GAD-7, SCL-90, etc.) with title, subtitle, duration, and Material 3 toggle switch (`md-switch`).
  - Toggling calls `toggleAssessmentAvailability` and shows success notification via `useSnackbar()`.
- **PATTERN**: `frontend/src/components/assessments/AssessmentsView.tsx`
- **VALIDATE**: `npm run lint`

#### Task 19: UPDATE `ReferralManagementView.tsx`, `ReferralActionFooter.tsx`, & `AssignQuestionnaireDialog.tsx`
- **IMPLEMENT**:
  1. In `ReferralManagementView.tsx`: Accept `userRole="admin"`.
  2. In `ReferralActionFooter.tsx`: Add handler for `'cancel_referral'` ("作废转诊") prompting a confirmation dialog with reason.
  3. In `AssignQuestionnaireDialog.tsx`: Filter out scales where `scale.isEnabled === false`.
- **PATTERN**: `frontend/src/components/records/ReferralActionFooter.tsx:50-95`
- **VALIDATE**: `npm run lint`

#### Task 20: CREATE `frontend/src/pages/AdminPage.tsx` & UPDATE `App.tsx`
- **IMPLEMENT**:
  1. `AdminPage.tsx`: Full standard workspace layout with tabs:
     - `控制面板` (Dashboard)
     - `用户管理` (User Management)
     - `转诊管理` (Referral Management)
     - `量表管理` (Assessment Management)
     - `通知中心` (Notifications)
     - `隐私安全` (Security & Consent)
  2. In `App.tsx`: Add `role === 'admin' ? <AdminPage />` and the Admin button in the demo role switcher.
- **PATTERN**: `frontend/src/pages/TrialAdminPage.tsx:40-160`
- **VALIDATE**: `npm run lint`

---

### Phase 5: MSW Mocks & End-to-End Validation

#### Task 21: UPDATE `frontend/src/mocks/handlers.ts` & Mock Data
- **IMPLEMENT**:
  1. Intercept `GET /api/dashboard/admin`, `GET /api/dashboard/admin/profile`.
  2. Intercept `GET /api/admin/users`, `PUT /api/admin/users/:id/status`, `DELETE /api/admin/users/:id`.
  3. Intercept `PUT /api/assessments/catalog/:batteryCode/availability`.
  4. Intercept `POST /api/referrals/:id/cancel`.
  5. Update `mockComputeAvailableActions` for `admin` role.
- **PATTERN**: `frontend/src/mocks/handlers.ts:30-80`
- **VALIDATE**: `npm run lint`

#### Task 22: CREATE Backend & Frontend Tests
- **IMPLEMENT**:
  1. `backend/src/test/kotlin/com/medicalsystem/backend/service/UserManagementServiceTest.kt`
  2. `backend/src/test/kotlin/com/medicalsystem/backend/controller/AdminUserControllerTest.kt`
  3. `frontend/src/pages/AdminPage.test.tsx`
- **PATTERN**: `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentServiceTest.kt`
- **VALIDATE**: `./mvnw test` and `npm run test`

---

## VALIDATION COMMANDS

Execute every command to guarantee zero regressions and complete feature correctness:

### Level 1: Frontend Linting & Type Checking
```bash
npm run lint --prefix frontend
```

### Level 2: Frontend Vitest Unit Tests
```bash
npm run test --prefix frontend -- --run
```

### Level 3: Backend Unit & Integration Tests
```bash
./mvnw test -f backend/pom.xml
```

### Level 4: Full Production Build Verification
```bash
npm run build --prefix frontend
./mvnw clean package -f backend/pom.xml -DskipTests
```

---

## ACCEPTANCE CRITERIA

- [ ] `UserRole.SYSTEM_ADMIN` is fully integrated into the backend security context, argument resolvers, and database converters.
- [ ] Admin can switch to `Admin` in the UI role switcher, loading `AdminPage.tsx` with all 6 navigation tabs.
- [ ] Admin can view all users, filter by role and status (`待审核`, `正常`, `已禁用`, `已注销`), approve accounts, toggle disabled/active, and soft-delete accounts.
- [ ] Admin can view all referrals in the platform, approve referrals directly, and execute fatal cancellation (`CANCELLED`) with audit justification.
- [ ] Admin can toggle assessment questionnaire availability switches; disabled scales cannot be newly assigned, while in-flight student tests can be completed.
- [ ] Admin Dashboard displays live metric cards (Total Users, Pending Approvals, Active Referrals, Completed Screenings).
- [ ] Zero TypeScript errors (`npm run lint`), all Vitest tests pass, and backend Maven test suite achieves 100% pass rate.
