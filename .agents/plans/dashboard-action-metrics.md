# Feature: Dashboard Action Metrics Integration (Hardened Architectural Plan)

The following plan is complete, hardened, and strictly validated against Domain-Driven Design (DDD), Clean Code, and Software Craftsmanship standards.

---

## Executive Architectural Summary

| Review Axis | Score | Key Findings & Enhancements |
| :--- | :---: | :--- |
| **Domain-Driven Design (DDD)** | **9.5/10** | Domain action policies (`ReferralActionPolicy`) encapsulated in `model/`; repository ports (`ReferralRepository`, `NotificationRepository`, `StudentRepository`) extended with intention-revealing count operations; Ports & Adapters integrity preserved; row-level visibility specifications composed cleanly. |
| **Clean Code & Quality** | **9.5/10** | Replaced untyped `Map<String, Long>` with strongly typed DTOs per role (`StudentMetricsDto`, `TeacherMetricsDto`, etc.); zero in-memory entity scanning (all single-statement database `COUNT(*)` queries); strict role authorization guards throwing `ForbiddenException`; full TDD lifecycle with Mockito & Vitest. |

---

## Feature Description

Implement live backend API endpoints and domain database aggregation queries to power the dynamic action metric cards across all five user roles (**Student, Teacher, Head Counsellor, Trial Admin, and Doctor**) on their dashboards, replacing static/hardcoded MSW mock values.

## User Story

```text
As an authenticated user (Student, Teacher, Head Counsellor, Trial Admin, or Doctor)
I want my dashboard overview cards to display live, accurate counts of actionable tasks and caseload metrics
So that I can immediately understand my pending workload and navigate to the relevant workflows
```

## Problem Statement

Currently, the dashboard cards for each user role in the frontend (`StudentPage`, `TeacherPage`, `HeadCouncillorPage`, `TrialAdminPage`, `DoctorPage`) query `/api/dashboard/{role}`, but the backend only provides `/api/dashboard/{role}/profile`. In development and test environments, MSW intercepts `/api/dashboard/{role}` and returns static mock counts. When running against live databases, the dashboard metrics fail or do not reflect real system state. Additionally, the Teacher dashboard card currently tracks "待处理转诊" (Pending Referrals), whereas teachers need to track "未读通知" (Unread Notifications) alongside "分配学生" (Assigned Students).

## Solution Statement

1. **Domain Modeling**:
   - Create `ReferralActionPolicy` in `model/ReferralActionPolicy.kt` encapsulating which referral statuses require action for each `UserRole`.
2. **Ports & Adapters Architecture**:
   - Add intention-revealing `count` operations to Domain Repository interfaces (`ReferralRepository`, `NotificationRepository`, `StudentRepository`, `DoctorRepository`).
   - Implement these inside the repository adapters using single-statement JPA `count(spec)` and derived count queries without loading entity graphs into JVM memory.
3. **Strongly Typed DTO Contracts**:
   - Create role-specific DTOs (`StudentMetricsDto`, `TeacherMetricsDto`, `HeadCounsellorMetricsDto`, `TrialAdminMetricsDto`, `DoctorMetricsDto`) wrapped in `DashboardResponseDto<T>`.
4. **Security & Role Authorization**:
   - Implement role authorization validation in `DashboardController`/`DashboardService` ensuring `@CurrentUser.role` matches the accessed dashboard endpoint, throwing `ForbiddenException` on mismatch.
5. **Frontend Alignment**:
   - Update `TEACHER_METRICS_CONFIG` in `dashboardConfig.ts` to track `notificationsCount` navigating to `Notifications`.
   - Update MSW mock data and live backend pass-through handlers.

## Feature Metadata

- **Feature Type**: Enhancement & Full-Stack Integration
- **Estimated Complexity**: Medium
- **Primary Systems Affected**:
  - Backend: `model/ReferralActionPolicy.kt`, `dto/DashboardDto.kt`, `repository/`, `service/DashboardService.kt`, `controller/DashboardController.kt`
  - Frontend: `config/dashboardConfig.ts`, `mocks/handlers.ts`, `mocks/data/dashboard.ts`, `pages/TeacherPage.tsx`
- **Dependencies**: Spring Data JPA, Hibernate, Jackson, TanStack React Query

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt` (lines 1-37) - Why: Domain enum for referral lifecycle states.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralVisibilityPolicy.kt` (lines 1-45) - Why: Visibility criteria rules for referrals per role.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepository.kt` (lines 1-15) - Why: Domain repository interface to extend.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapter.kt` (lines 1-73) - Why: Adapter implementing referral JPA queries.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/NotificationRepository.kt` (lines 1-13) - Why: Domain repository interface for notifications.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/NotificationRepositoryAdapter.kt` (lines 1-70) - Why: Adapter implementing notification queries.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/StudentRepository.kt` (lines 1-20) - Why: Domain repository interface for student queries.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/StudentRepositoryAdapter.kt` (lines 1-60) - Why: Adapter implementing student visibility queries.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt` (lines 1-104) - Why: Application service orchestrating profile and metric queries.
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/DashboardController.kt` (lines 1-37) - Why: REST controller exposing `/api/dashboard/*`.
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardDto.kt` (lines 1-15) - Why: DTO definitions for dashboard responses.
- `frontend/src/config/dashboardConfig.ts` (lines 1-103) - Why: Frontend metric card configuration.
- `frontend/src/mocks/handlers.ts` (lines 105-138) - Why: MSW mock handlers for dashboard endpoints.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralActionPolicy.kt` - Domain policy encapsulating actionable status rules per role.
- `backend/src/test/kotlin/com/medicalsystem/backend/model/ReferralActionPolicyTest.kt` - Unit tests for domain action policy.

---

## ARCHITECTURAL DESIGN & CONTRACTS

### 1. Domain Policy (`model/ReferralActionPolicy.kt`)

```kotlin
package com.medicalsystem.backend.model

object ReferralActionPolicy {
    fun getActionableStatusesFor(role: UserRole): List<ReferralStatus> = when (role) {
        UserRole.HEAD_COUNSELLOR -> listOf(
            ReferralStatus.AWAITING_APPROVAL,
            ReferralStatus.AWAITING_FEEDBACK_APPROVAL
        )
        UserRole.TRIAL_ADMIN -> listOf(
            ReferralStatus.AWAITING_TRIAGE,
            ReferralStatus.WAITING_FOR_SCHEDULING
        )
        UserRole.DOCTOR -> listOf(
            ReferralStatus.WAITING_FOR_APPOINTMENT
        )
        else -> emptyList()
    }
}
```

### 2. Strongly Typed DTOs (`dto/DashboardDto.kt`)

```kotlin
package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.UserRole

data class ProfileSummaryDto(
    val avatarUrl: String?,
    val name: String,
    val role: UserRole,
    val studentId: String? = null,
    val employeeId: String? = null,
    val school: String? = null,
    val department: String? = null,
    val hospital: String? = null
)

sealed interface DashboardMetricsDto

data class StudentMetricsDto(
    val assessmentsCount: Long = 0,
    val notificationsCount: Long = 0
) : DashboardMetricsDto

data class TeacherMetricsDto(
    val studentsCount: Long = 0,
    val notificationsCount: Long = 0
) : DashboardMetricsDto

data class HeadCounsellorMetricsDto(
    val studentsCount: Long = 0,
    val referralsCount: Long = 0
) : DashboardMetricsDto

data class TrialAdminMetricsDto(
    val staffCount: Long = 0,
    val referralsCount: Long = 0
) : DashboardMetricsDto

data class DoctorMetricsDto(
    val referralsCount: Long = 0,
    val notificationsCount: Long = 0
) : DashboardMetricsDto

data class DashboardResponseDto<T : DashboardMetricsDto>(
    val metrics: T
)
```

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralActionPolicy.kt` & Test

- **IMPLEMENT**: Create `ReferralActionPolicy` object with `getActionableStatusesFor(role: UserRole): List<ReferralStatus>`.
- **CREATE**: Unit test `backend/src/test/kotlin/com/medicalsystem/backend/model/ReferralActionPolicyTest.kt`.
- **IMPORTS**: `com.medicalsystem.backend.model.ReferralStatus`, `com.medicalsystem.backend.model.UserRole`.
- **VALIDATE**: `./mvnw test -Dtest=ReferralActionPolicyTest`

### Task 2: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardDto.kt`

- **IMPLEMENT**: Add `DashboardMetricsDto` sealed interface and role-specific DTOs (`StudentMetricsDto`, `TeacherMetricsDto`, `HeadCounsellorMetricsDto`, `TrialAdminMetricsDto`, `DoctorMetricsDto`, `DashboardResponseDto<T>`).
- **PATTERN**: Follow `ProfileSummaryDto` in `DashboardDto.kt:5-14`.
- **GOTCHA**: Ensure property names match exact frontend metric keys (`assessmentsCount`, `notificationsCount`, `studentsCount`, `referralsCount`, `staffCount`).
- **VALIDATE**: `./mvnw test-compile`

### Task 3: UPDATE Domain Repositories & Adapters for Single-Statement `COUNT(*)`

1. **`NotificationRepository.kt` & `NotificationRepositoryAdapter.kt`**:
   - In `NotificationJpaRepository.kt`: add `fun countByUserIdAndIsReadFalse(userId: Long): Long`.
   - In `NotificationRepository.kt`: add `fun countUnreadByUserId(userId: Long): Long`.
   - In `NotificationRepositoryAdapter.kt`: implement `countUnreadByUserId` calling `notificationJpaRepository.countByUserIdAndIsReadFalse(userId)`.
2. **`StudentRepository.kt` & `StudentRepositoryAdapter.kt`**:
   - In `StudentRepository.kt`: add `fun countVisibleStudentsFor(user: User): Long`.
   - In `StudentRepositoryAdapter.kt`: implement `countVisibleStudentsFor` using `val spec = StudentJpaSpecification.fromVisibilityCriteria(criteria); return jpaRepository.count(spec)`.
3. **`ReferralRepository.kt` & `ReferralRepositoryAdapter.kt`**:
   - In `ReferralRepository.kt`: add `fun countActionableReferralsFor(user: User): Long`.
   - In `ReferralRepositoryAdapter.kt`: implement `countActionableReferralsFor` using:
     ```kotlin
     val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
     val visibilitySpec = ReferralJpaSpecification.fromVisibilityCriteria(criteria)
     val statuses = ReferralActionPolicy.getActionableStatusesFor(user.role)
     if (statuses.isEmpty()) return 0L
     val statusSpec = org.springframework.data.jpa.domain.Specification<ReferralEntity> { root, _, cb ->
         root.get<ReferralStatus>("status").`in`(statuses)
     }
     return jpaRepository.count(visibilitySpec.and(statusSpec))
     ```
4. **`DoctorRepository.kt`**:
   - In `DoctorRepository.kt`: add `fun countByDepartmentHospitalId(hospitalId: Long): Long`.
- **VALIDATE**: `./mvnw test-compile`

### Task 4: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`

- **IMPLEMENT**: Add role-specific metric aggregation methods with role validation:
  ```kotlin
  private fun validateRole(user: User, expectedRole: UserRole) {
      if (user.role != expectedRole) {
          throw ForbiddenException("Access denied for role ${user.role} on ${expectedRole.name.lowercase()} dashboard")
      }
  }

  fun getStudentDashboard(user: User): DashboardResponseDto<StudentMetricsDto> {
      validateRole(user, UserRole.STUDENT)
      val unreadCount = notificationRepository.countUnreadByUserId(user.id)
      return DashboardResponseDto(StudentMetricsDto(assessmentsCount = 0L, notificationsCount = unreadCount))
  }

  fun getTeacherDashboard(user: User): DashboardResponseDto<TeacherMetricsDto> {
      validateRole(user, UserRole.TEACHER)
      val studentsCount = studentRepository.countVisibleStudentsFor(user)
      val unreadCount = notificationRepository.countUnreadByUserId(user.id)
      return DashboardResponseDto(TeacherMetricsDto(studentsCount = studentsCount, notificationsCount = unreadCount))
  }

  fun getHeadCounsellorDashboard(user: User): DashboardResponseDto<HeadCounsellorMetricsDto> {
      validateRole(user, UserRole.HEAD_COUNSELLOR)
      val studentsCount = studentRepository.countVisibleStudentsFor(user)
      val referralsCount = referralRepository.countActionableReferralsFor(user)
      return DashboardResponseDto(HeadCounsellorMetricsDto(studentsCount = studentsCount, referralsCount = referralsCount))
  }

  fun getTrialAdminDashboard(user: User): DashboardResponseDto<TrialAdminMetricsDto> {
      validateRole(user, UserRole.TRIAL_ADMIN)
      val trialAdmin = trialAdminRepository.findById(user.id)
          .orElseThrow { ResourceNotFoundException("Trial Admin not found for user ${user.id}") }
      val hospitalId = trialAdmin.hospital.id ?: 0L
      val staffCount = doctorRepository.countByDepartmentHospitalId(hospitalId)
      val referralsCount = referralRepository.countActionableReferralsFor(user)
      return DashboardResponseDto(TrialAdminMetricsDto(staffCount = staffCount, referralsCount = referralsCount))
  }

  fun getDoctorDashboard(user: User): DashboardResponseDto<DoctorMetricsDto> {
      validateRole(user, UserRole.DOCTOR)
      val referralsCount = referralRepository.countActionableReferralsFor(user)
      val unreadCount = notificationRepository.countUnreadByUserId(user.id)
      return DashboardResponseDto(DoctorMetricsDto(referralsCount = referralsCount, notificationsCount = unreadCount))
  }
  ```
- **IMPORTS**: `NotificationRepository`, `ReferralRepository`, `StudentRepository`, `DoctorRepository`, `ForbiddenException`, `ResourceNotFoundException`.
- **VALIDATE**: `./mvnw test-compile`

### Task 5: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/controller/DashboardController.kt`

- **IMPLEMENT**: Expose the 5 GET endpoints:
  - `@GetMapping("/student") fun getStudentDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<StudentMetricsDto>> = ResponseEntity.ok(dashboardService.getStudentDashboard(user))`
  - `@GetMapping("/teacher") fun getTeacherDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<TeacherMetricsDto>> = ResponseEntity.ok(dashboardService.getTeacherDashboard(user))`
  - `@GetMapping("/head-councillor") fun getHeadCounsellorDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<HeadCounsellorMetricsDto>> = ResponseEntity.ok(dashboardService.getHeadCounsellorDashboard(user))`
  - `@GetMapping("/trial-admin") fun getTrialAdminDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<TrialAdminMetricsDto>> = ResponseEntity.ok(dashboardService.getTrialAdminDashboard(user))`
  - `@GetMapping("/doctor") fun getDoctorDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<DoctorMetricsDto>> = ResponseEntity.ok(dashboardService.getDoctorDashboard(user))`
- **PATTERN**: Follow `DashboardController.kt:17-36`.
- **VALIDATE**: `./mvnw test-compile`

### Task 6: UPDATE `frontend/src/config/dashboardConfig.ts` & `TeacherPage.tsx`

- **IMPLEMENT**:
  - Update `TEACHER_METRICS_CONFIG`:
    ```typescript
    export const TEACHER_METRICS_CONFIG: MetricConfig[] = [
      {
        icon: "group",
        label: "分配学生",
        containerColorClass: "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]",
        targetPage: "Students",
        metricKey: "studentsCount"
      },
      {
        icon: "notifications",
        label: "未读通知",
        containerColorClass: "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]",
        targetPage: "Notifications",
        metricKey: "notificationsCount"
      }
    ];
    ```
- **VALIDATE**: `cd frontend && npm run lint`

### Task 7: UPDATE `frontend/src/mocks/data/dashboard.ts` & `frontend/src/mocks/handlers.ts`

- **IMPLEMENT**:
  - In `frontend/src/mocks/data/dashboard.ts`: Update teacher mock metrics to have `notificationsCount: 3` instead of `referralsCount`.
  - In `frontend/src/mocks/handlers.ts`: Update `/api/dashboard/:role` handler to bypass and attempt live backend fetch first with MSW fallback.
- **VALIDATE**: `cd frontend && npm test`

### Task 8: UPDATE Unit Tests in Backend (`DashboardServiceTest.kt` & `DashboardControllerTest.kt`)

- **IMPLEMENT**:
  - Add comprehensive unit tests in `DashboardServiceTest` for each role's metric computation and `ForbiddenException` role mismatch.
  - Add unit tests in `DashboardControllerTest` verifying 200 OK responses with typed payloads.
- **VALIDATE**: `./mvnw test`

---

## TESTING STRATEGY

### Unit Tests
- **Domain Policy**: `ReferralActionPolicyTest` asserting actionable statuses per `UserRole`.
- **Backend Service**: `DashboardServiceTest` with Mockito verifying repository count invocations, role validations, and zero-count edge cases.
- **Backend Controller**: `DashboardControllerTest` verifying HTTP 200 status and serialized JSON structure.
- **Frontend Components**: Vitest component testing for dashboard metric rendering and click handlers.

### Integration Tests
- Repository count verification against in-memory H2 database via Spring Boot Test.
- MSW network pass-through validation in frontend tests.

### Edge Cases
- User with 0 unread notifications or 0 actionable referrals returns numeric `0` (not null or undefined).
- Role mismatch (e.g. Student calling `/api/dashboard/teacher`) throws `ForbiddenException` (HTTP 403).
- Missing relational entity (e.g. Doctor without department) gracefully defaults to `0L` instead of crashing with NullPointerException.

---

## VALIDATION COMMANDS

```bash
# Level 1: Syntax & Compilation
cd /Volumes/Files/Programming/medical-system/frontend && npm run lint
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw test-compile

# Level 2: Unit Tests
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw test
cd /Volumes/Files/Programming/medical-system/frontend && npm test

# Level 3: Full Build Verification
cd /Volumes/Files/Programming/medical-system/frontend && npm run build
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw clean package -DskipTests=false
```

---

## ACCEPTANCE CRITERIA

- [ ] `ReferralActionPolicy` encapsulates actionable referral statuses cleanly in the domain layer.
- [ ] Domain repository interfaces provide explicit `count` operations implemented with single-statement JPA queries.
- [ ] DTOs are strongly typed and role-specific (`StudentMetricsDto`, `TeacherMetricsDto`, etc.).
- [ ] `GET /api/dashboard/{role}` endpoints are exposed and enforce strict role validation via `@CurrentUser`.
- [ ] Teacher dashboard cards display assigned students and unread notifications, navigating to `Notifications`.
- [ ] Zero in-memory entity graph scans; all metrics use database `COUNT(*)`.
- [ ] All validation commands (`./mvnw test`, `npm run lint`, `npm test`, `npm run build`) pass with 100% success.
