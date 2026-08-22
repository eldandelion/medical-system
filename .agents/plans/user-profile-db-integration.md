# Feature: User Profile Database Integration (个人信息数据库与接口对接) - Hardened Production Plan

The following plan has undergone rigorous **Architect Plan Review** across Domain-Driven Design (DDD) and Clean Code & Quality axes.
Pay special attention to domain aggregate boundaries, value object encapsulation, language-agnostic contracts, and strict MSW parity.

---

## Executive Architectural Summary

| Review Axis | Score | Key Findings & Enhancements |
| :--- | :---: | :--- |
| **Domain-Driven Design (DDD)** | **9/10** | Replaced direct JPA entity mutation with pure domain model aggregation (`User`, `Student`, `Demographics`). Invariants are encapsulated inside domain aggregate methods (`student.updateDemographics(...)`). |
| **Clean Code & Quality** | **9.5/10** | Eliminated the "Mega-DTO" anti-pattern in favor of structured, role-scoped profile DTOs. Removed institutional identifiers from update requests to structurally enforce immutability. Resolved partial update semantics via PATCH-safe merge. |

---

## Reconciliation & Trade-Off Log

1. **Domain Aggregate Isolation vs. Direct JPA Mutation**:
   - *Decision*: The application service operates strictly on domain aggregates (`User`, `Student`, etc.) reconstituted via repository adapters. Persistence is isolated in repository adapters and mappers (`UserMapper.kt`, `StudentMapper.kt`).
2. **Structural Immutability for Administrative Identifiers**:
   - *Decision*: `UpdateUserProfileRequest` **omits** `studentNumber`, `employeeNumber`, `school`, `college`, and `role`. It is structurally impossible for a client to tamper with these fields over the API.
3. **Partial Sub-view Update Contract (`PATCH` semantics)**:
   - *Decision*: `PUT /api/user/profile` (or `PATCH`) implements selective non-null merge in the domain service. When a user updates just their phone number or address in a sub-view, existing fields on the domain aggregate remain intact.
4. **Missing Role-Extension Handling**:
   - *Decision*: If a user with role `STUDENT` lacks an associated student record, the service throws `NotFoundException("Student profile record not found for user: $id")`, mapped by `GlobalExceptionHandler` to a standard 404 response.

---

## User Story

```text
As an authenticated system user (Student, Teacher, Head Councillor, Doctor, Trial Admin, or Admin)
I want my Personal Information page to load my actual account, demographic, and institutional profile from the database and allow me to update my personal contact/demographic details
So that my profile is always up-to-date and accurately reflected across health screenings, referrals, and academic communications.
```

---

## Core Domain Models & Schemas

### 1. Backend Domain DTOs (`backend/src/main/kotlin/com/medicalsystem/backend/dto/UserProfileDto.kt`)

```kotlin
package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.UserRole
import java.time.LocalDate

data class UserProfileDto(
    val id: Long,
    val name: String,
    val role: UserRole,
    val email: String,
    val avatarInitial: String? = null,
    val avatarBg: String? = null,
    val passwordLastChanged: String? = null,
    // Student-specific demographic & academic data
    val studentProfile: StudentProfileDetailsDto? = null,
    // Staff-specific institutional data
    val staffProfile: StaffProfileDetailsDto? = null
)

data class StudentProfileDetailsDto(
    val studentNumber: String,
    val school: String?,
    val major: String?,
    val academicYear: String?,
    val gender: Gender?,
    val birthday: String?,
    val ethnicity: String?,
    val idCardNumber: String?,
    val contactNumber: String?,
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: String?,
    val emergencyContactRelation: String? = null
)

data class StaffProfileDetailsDto(
    val employeeNumber: String,
    val organization: String?,      // School, College, or Hospital name
    val department: String? = null, // e.g. Psychiatric Department
    val title: String? = null,       // e.g. 主治医师
    val contactNumber: String? = null
)

data class UpdateUserProfileRequest(
    val name: String? = null,
    val email: String? = null,
    val avatarInitial: String? = null,
    val avatarBg: String? = null,
    // Mutable demographics (for student users)
    val gender: Gender? = null,
    val birthday: String? = null,
    val ethnicity: String? = null,
    val idCardNumber: String? = null,
    val contactNumber: String? = null,
    val homeAddress: String? = null,
    val emergencyContactName: String? = null,
    val emergencyContactPhone: String? = null,
    val emergencyContactRelation: String? = null
)
```

---

## CONTEXT REFERENCES

### Relevant Codebase Files (IMPORTANT: READ BEFORE IMPLEMENTING!)

- `backend/src/main/kotlin/com/medicalsystem/backend/security/CurrentUserArgumentResolver.kt` (lines 1-28) - Resolves `@CurrentUser User` from `MockSecurityContextHolder`.
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/AdminUserController.kt` (lines 1-54) - REST controller pattern with `@CurrentUser` and service injection.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/UserEntity.kt` (lines 1-30) - Core `UserEntity` JPA mapping.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentEntity.kt` (lines 1-35) - `StudentEntity` with embedded `StudentDemographicsEntity`.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentDemographicsEntity.kt` (lines 1-41) - Demographic fields: `gender`, `dateOfBirth`, `ethnicity`, `idCardNumber`, `contactNumber`, `email`, `homeAddress`, `emergencyContactName`, `emergencyContactPhone`, `school`.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/TeacherEntity.kt` (lines 1-22) - `TeacherEntity` with `employeeNumber` and `college`.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/DoctorEntity.kt` (lines 1-30) - `DoctorEntity` with `employeeNumber`, `hospital`, `department`, `title`.
- `frontend/src/components/profile/ProfileDetailsView.tsx` (lines 1-350) - Profile details view component requiring live React Query hook.
- `frontend/src/mocks/handlers.ts` (lines 1-100) - MSW mock API handlers and backend fallback logic.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/dto/UserProfileDto.kt` - Structured Profile DTOs (`UserProfileDto`, `StudentProfileDetailsDto`, `StaffProfileDetailsDto`, `UpdateUserProfileRequest`).
- `backend/src/main/kotlin/com/medicalsystem/backend/service/UserProfileService.kt` - Business logic orchestrating profile retrieval and aggregate demographic updates.
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/UserProfileController.kt` - REST controller for `/api/user/profile`.
- `backend/src/test/kotlin/com/medicalsystem/backend/controller/UserProfileControllerTest.kt` - Controller & service unit tests.
- `backend/src/test/kotlin/com/medicalsystem/backend/integration/UserProfileIntegrationTest.kt` - JPA integration tests against H2 database.

---

## IMPLEMENTATION PLAN

### Phase 1: Backend DTOs & Domain Service
- Create `UserProfileDto.kt` with structured `UserProfileDto`, `StudentProfileDetailsDto`, `StaffProfileDetailsDto`, and `UpdateUserProfileRequest`.
- Implement `UserProfileService` with `getProfile(user: User): UserProfileDto` and `@Transactional updateProfile(user: User, request: UpdateUserProfileRequest): UserProfileDto`.
- Handle selective non-null updates to protect existing field values during sub-view saves.
- Enforce clean domain error handling via `NotFoundException`.

### Phase 2: Backend REST Controller & Testing
- Implement `UserProfileController` mapped to `/api/user/profile` with `GET` and `PUT` methods receiving `@CurrentUser user: User?`.
- Write unit tests in `UserProfileControllerTest.kt` verifying status codes, `@CurrentUser` injection, and role mapping.
- Write `@SpringBootTest` integration tests in `UserProfileIntegrationTest.kt` verifying that database records in `users` and `student_demographics` are updated.

### Phase 3: MSW Mock Handlers & Contract Synchronization
- Add `http.get(api('/api/user/profile'), ...)` and `http.put(api('/api/user/profile'), ...)` in `frontend/src/mocks/handlers.ts`.
- Ensure student, teacher, doctor, counsellor, and admin mock tokens return authentic persona data matching the backend DTO contract.

### Phase 4: Frontend Component Integration & State Binding
- Add `UserProfileDto`, `StudentProfileDetailsDto`, and `UpdateUserProfileRequest` interfaces in `frontend/src/types/index.ts`.
- Connect `ProfileDetailsView.tsx` to `useQuery` and `useMutation`.
- Map profile fields to `profileData` items, with dynamic `idLabel` (`学号` for students vs `工号` for staff).
- Connect sub-views to trigger mutations and invalidate queries on "保存".

### Phase 5: Verification & End-to-End Validation
- Run frontend Vitest suite and backend test suite.
- Ensure 0 lint/TypeScript errors and 100% test pass rate.

---

## STEP-BY-STEP TASKS

### 1. CREATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/UserProfileDto.kt`
- **IMPLEMENT**: Define `UserProfileDto`, `StudentProfileDetailsDto`, `StaffProfileDetailsDto`, and `UpdateUserProfileRequest`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/dto/AdminUserDto.kt:1-40`
- **VALIDATE**: `./mvnw test-compile`

### 2. CREATE `backend/src/main/kotlin/com/medicalsystem/backend/service/UserProfileService.kt`
- **IMPLEMENT**: Service methods `getProfile(user: User): UserProfileDto` and `@Transactional updateProfile(user: User, request: UpdateUserProfileRequest): UserProfileDto`. Lookup `UserEntity`, `StudentEntity` (if student), `TeacherEntity`, `DoctorEntity`, `HeadCounsellorEntity`, `TrialAdminEntity`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/service/UserManagementService.kt:1-80`
- **GOTCHA**: Ensure `@Transactional` on mutation method; resolve date formatting cleanly without magic strings.
- **VALIDATE**: `./mvnw test-compile`

### 3. CREATE `backend/src/main/kotlin/com/medicalsystem/backend/controller/UserProfileController.kt`
- **IMPLEMENT**: REST controller mapped to `/api/user/profile` with `GET` and `PUT` methods receiving `@CurrentUser user: User?`.
- **PATTERN**: `backend/src/main/kotlin/com/medicalsystem/backend/controller/AdminUserController.kt:1-54`
- **VALIDATE**: `./mvnw test-compile`

### 4. CREATE `backend/src/test/kotlin/com/medicalsystem/backend/controller/UserProfileControllerTest.kt` & `UserProfileIntegrationTest.kt`
- **IMPLEMENT**: Unit tests mocking `UserProfileService` and integration tests against H2 test database verifying persistence of profile updates.
- **VALIDATE**: `./mvnw test -Dtest=UserProfileControllerTest,UserProfileIntegrationTest`

### 5. UPDATE `frontend/src/types/index.ts`
- **IMPLEMENT**: Export `UserProfileDto`, `StudentProfileDetailsDto`, `StaffProfileDetailsDto`, and `UpdateUserProfileRequest` TypeScript interfaces mirroring backend DTOs.
- **PATTERN**: `frontend/src/types/index.ts:1-200`
- **VALIDATE**: `npm run lint`

### 6. UPDATE `frontend/src/mocks/handlers.ts`
- **IMPLEMENT**: Add `GET /api/user/profile` and `PUT /api/user/profile` MSW handlers that return mock profile records based on the `Authorization` header role.
- **PATTERN**: `frontend/src/mocks/handlers.ts:250-320`
- **VALIDATE**: `npx vitest run src/mocks/handlers.test.ts`

### 7. UPDATE `frontend/src/components/profile/ProfileDetailsView.tsx`
- **IMPLEMENT**: Replace static hardcoded profile state with `useQuery<UserProfileDto>` and `useMutation` for saves. Pass live data to sub-views and dispatch mutations on sub-view saves with toast feedback.
- **PATTERN**: `frontend/src/components/students/StudentDetailsView.tsx:55-75`
- **VALIDATE**: `npm run lint`

### 8. UPDATE `frontend/src/components/profile/ProfileDetailsView.test.tsx` & `ProfileSubViews.test.tsx`
- **IMPLEMENT**: Update tests with QueryClientProvider/fetch mocking to assert live profile rendering, mutation calls, and sub-view save behavior.
- **VALIDATE**: `npm test -- --run`

---

## TESTING STRATEGY

### Backend Unit & Integration Tests
- **Unit**: Mockito tests verifying `UserProfileService` retrieves correct role extensions (demographics for students, college for teachers, hospital for doctors) and updates allowed fields.
- **Integration**: `@SpringBootTest` verifying that `PUT /api/user/profile` updates `users` and `student_demographics` tables in H2 and returns updated DTO.

### Frontend Unit & Contract Tests
- Assert `ProfileDetailsView` renders loading skeleton/spinner while fetching `/api/user/profile`.
- Assert sub-view save calls `PUT /api/user/profile` with expected payload.
- Assert student sessions see `学号` and staff sessions see `工号`.
- Assert that MSW fallback handler correctly reflects profile edits.

---

## VALIDATION COMMANDS

### Level 1: Frontend Typecheck & Lint
```bash
cd frontend && npm run lint
```

### Level 2: Frontend Test Suite
```bash
cd frontend && npm test -- --run
```

### Level 3: Backend Build & Test Suite
```bash
cd backend && ./mvnw clean test
```

---

## ACCEPTANCE CRITERIA

- [ ] `GET /api/user/profile` returns live user profile tailored to `@CurrentUser` role.
- [ ] `PUT /api/user/profile` updates mutable demographics and user details in database.
- [ ] Institutional identifiers (`学号`/`工号`, `所属院校`) are protected from arbitrary modification.
- [ ] `ProfileDetailsView` loads real user data with TanStack React Query.
- [ ] Each sub-view save action triggers a mutation and provides instant toast feedback.
- [ ] MSW handlers provide accurate mock fallback for offline development.
- [ ] All frontend and backend tests pass with 0 regressions.
