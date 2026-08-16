# Feature: Fix Referral Details Psychometrics Tab Loading

The following plan must be strictly adhered to during execution. Validate documentation and codebase patterns and run validation commands after each step.

## Feature Description
Fix the bug where navigating to the **Psychometrics (量表数据)** tab in the **Referral Details View (`ReferralDetailsView`)** displays the error **"无法加载量表数据" (Failed to load psychometrics data)** when logged in as a Teacher (or Doctor / Trial Admin), while it successfully renders in `StudentDetailsView`.

## User Story
```
As a Teacher, Head Councillor, Doctor, or Trial Admin
I want to view the student's psychological scale results and psychometrics summary within the Referral Details View
So that I can review clinical evaluation metrics (PHQ-9, GAD-7, PSQI, SCID diagnosis) directly in the referral workflow
```

## Problem Statement
1. `ReferralDto` and `ReferralDetailsDto` in the backend omit `studentId: Long` (the database primary key of the student), exposing only `studentName` and `studentNumber`.
2. `ReferralDetailsView.tsx` attempted to look up the student via an unauthenticated `fetch('/api/students?name=' + referral.studentName)` without `Authorization: Bearer ${session.token}`.
3. The live backend rejected the unauthenticated fetch with `403 Forbidden`, causing `studentData` to remain `null`.
4. As a result, `PsychometricsTabContent` received an undefined/mismatched student ID, failing with `StudentNotFoundException` or immediately displaying `"无法加载量表数据"`.
5. In addition, `StudentVisibilityPolicy` defaulted `DOCTOR` and `TRIAL_ADMIN` to `StudentVisibilityCriteria.None`, blocking clinical staff from viewing psychometrics for referred students.

## Solution Statement
1. **Backend DTO & Mapping**: Add `val studentId: Long` to `ReferralDto`, mapped directly from `Referral.studentId` in `ReferralMapper.toDto()`.
2. **Backend Domain Policy**: Update `StudentVisibilityPolicy` and `StudentJpaSpecification` to grant appropriate student visibility to `DOCTOR` (`ByAssignedDoctor`) and `TRIAL_ADMIN` (`ByTrialAdmin`).
3. **Frontend Contract**: Update `Referral` in `frontend/src/types/index.ts` to include `studentId: number | string`.
4. **Frontend View Cleanup**: Remove the unauthenticated `fetch('/api/students?name=...')` hack from `ReferralDetailsView.tsx` and pass `student={{ id: referral.studentId || referralDetails.baseInfo.studentId, name: referral.studentName, scidDiagnosis: referralDetails.triageInfo?.scidDiagnosis }}` directly to `<PsychometricsTabContent />`.
5. **MSW Mocks**: Synchronize `frontend/src/mocks/data/referrals.ts` so all mock referrals include `studentId`.

## Feature Metadata
- **Feature Type**: Bug Fix / Contract Refactor
- **Estimated Complexity**: Low-Medium
- **Primary Systems Affected**: `ReferralDto`, `ReferralMapper`, `StudentVisibilityPolicy`, `StudentJpaSpecification`, `ReferralDetailsView.tsx`, `types/index.ts`
- **Dependencies**: Spring Boot 4.1, Spring Data JPA, React 19, TanStack React Query 5

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/ReferralDto.kt` (lines 8-20) - Referral DTO contract.
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/ReferralMapper.kt` (lines 164-178, 180-236) - Maps domain aggregate to `ReferralDto` and `ReferralDetailsDto`.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/StudentVisibilityPolicy.kt` (lines 1-20) - Domain visibility rules for students.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/StudentJpaSpecification.kt` (lines 1-23) - JPA criteria specification for student visibility.
- `frontend/src/types/index.ts` (lines 27-46) - Frontend `Referral` TypeScript contract.
- `frontend/src/components/records/ReferralDetailsView.tsx` (lines 134-153, 256-274) - Referral presenter and sub-tab wiring.
- `frontend/src/components/assessments/PsychometricsTabContent.tsx` (lines 80-110) - Psychometrics tab component and query.
- `frontend/src/mocks/data/referrals.ts` (lines 1-60) - Mock referral database.

### Patterns to Follow
- **DTO Immutability & Clean Types**: Mirror Kotlin DTO property names and non-null types in TypeScript interfaces (`GEMINI.md`).
- **Defensive Rendering**: Provide default fallbacks (`student?.id`) and ensure query keys in React Query include `session.token`.

---

## STEP-BY-STEP TASKS

### Task 1: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/ReferralDto.kt`
- **IMPLEMENT**: Add `val studentId: Long` to `data class ReferralDto`.
- **PATTERN**: Mirror `StudentDto.id` and other strongly typed entity DTOs.
- **VALIDATE**: `./mvnw compile-kotlin`

### Task 2: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/mapper/ReferralMapper.kt`
- **IMPLEMENT**: In `toDto()`, populate `studentId = model.studentId`.
- **PATTERN**: Existing `toDto` mapping in `ReferralMapper.kt:164-178`.
- **VALIDATE**: `./mvnw test -Dtest=ReferralMapperTest`

### Task 3: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/StudentVisibilityPolicy.kt` & `StudentJpaSpecification.kt`
- **IMPLEMENT**:
  - Add `ByAssignedDoctor(val doctorId: Long)` and `ByTrialAdmin(val adminId: Long)` to `StudentVisibilityCriteria`.
  - In `StudentVisibilityPolicy.getVisibilityCriteria(user)`:
    - `UserRole.DOCTOR -> StudentVisibilityCriteria.ByAssignedDoctor(user.id)`
    - `UserRole.TRIAL_ADMIN -> StudentVisibilityCriteria.ByTrialAdmin(user.id)`
  - In `StudentJpaSpecification.fromVisibilityCriteria`:
    - Implement `ByAssignedDoctor` using a subquery checking `ReferralEntity.destination.doctor.userId == doctorId`.
    - Implement `ByTrialAdmin` using a subquery checking `ReferralEntity.steps.type in [TRIAGE, SCHEDULING, EVALUATION, FEEDBACK]`.
- **VALIDATE**: `./mvnw test -Dtest=StudentVisibilityPolicyTest,StudentRepositoryAdapterTest`

### Task 4: UPDATE `backend/src/test/kotlin/...` Test Suites
- **IMPLEMENT**:
  - Update `ReferralMapperTest.kt` to assert `assertEquals(100L, dto.studentId)`.
  - Update `ReferralServiceTest.kt` or `ReferralControllerTest.kt` if mock `ReferralDto` constructors require `studentId`.
  - Update `StudentVisibilityPolicyTest.kt` to verify `DOCTOR` and `TRIAL_ADMIN` criteria.
  - Add integration tests in `StudentRepositoryAdapterTest.kt` for doctor and trial admin visibility.
- **VALIDATE**: `./mvnw test`

### Task 5: UPDATE `frontend/src/types/index.ts`
- **IMPLEMENT**: Add `studentId: number | string;` to `interface Referral`.
- **PATTERN**: `types/index.ts:27-46`.
- **VALIDATE**: `npm run lint` (`tsc --noEmit`)

### Task 6: UPDATE `frontend/src/mocks/data/referrals.ts`
- **IMPLEMENT**: Add `studentId: '1'` (or matching mock student IDs) to all mock referral objects in `baseReferrals`.
- **VALIDATE**: `npx vitest run src/mocks/handlers.test.ts`

### Task 7: REFACTOR `frontend/src/components/records/ReferralDetailsView.tsx`
- **IMPLEMENT**:
  - Remove `const [studentData, setStudentData] = React.useState<any>(null);` and the `useEffect` performing unauthenticated `fetch(/api/students?name=...)` (lines 134-152).
  - In the `psychometrics` tab render (lines 265-271), pass:
    ```tsx
    <PsychometricsTabContent
      student={{
        id: referral.studentId || referralDetails.baseInfo?.studentId,
        name: referral.studentName,
        studentNumber: referral.studentNumber,
        scidDiagnosis: referralDetails.triageInfo?.scidDiagnosis
      }}
    />
    ```
- **VALIDATE**: `npm run lint && npx vitest run src/components/records/`

### Task 8: ADD / UPDATE Component Tests
- **IMPLEMENT**:
  - Update `ReferralOverviewTab.test.tsx` or add `ReferralDetailsView.test.tsx` ensuring `PsychometricsTabContent` receives the correct `student.id` without making unauthenticated queries.
- **VALIDATE**: `npx vitest run src/components/records/ src/components/assessments/`

---

## VALIDATION COMMANDS

### Level 1: Syntax & Type Checking
```bash
# Backend compilation
cd backend && ./mvnw compile-kotlin

# Frontend TypeScript check
cd frontend && npm run lint
```

### Level 2: Backend Unit & Integration Tests
```bash
cd backend && ./mvnw test
```

### Level 3: Frontend Unit Tests
```bash
cd frontend && npx vitest run src/components/records/ src/components/assessments/ src/mocks/
```

### Level 4: Production Build
```bash
cd frontend && npm run build
```

---

## ACCEPTANCE CRITERIA
- [ ] `ReferralDto` contains `val studentId: Long` mapped from `model.studentId`.
- [ ] `StudentVisibilityPolicy` grants authorized access to `TEACHER`, `DOCTOR`, and `TRIAL_ADMIN`.
- [ ] Unauthenticated `fetch('/api/students?name=...')` hack is completely removed from `ReferralDetailsView.tsx`.
- [ ] Navigating to the Psychometrics tab in `ReferralDetailsView` successfully requests `/api/students/{studentId}/psychometrics` with `Authorization: Bearer <token>` and renders test scores (GAD-7, PHQ-9, PSQI).
- [ ] All backend unit and integration tests pass (167+ tests).
- [ ] All frontend unit tests and type checks pass with 0 errors.
