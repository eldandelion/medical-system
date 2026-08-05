# Feature: Add sourceAssignmentId to PsychometricTest

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Enhance the `PsychometricTest` domain model and persistence entity to include a `sourceAssignmentId` (nullable Long). This acts as a loosely coupled correlation ID pointing back to the `AssessmentAssignment` that generated the test. If `null`, the test is assumed to be imported externally. The UI will then use this field to display a chip indicating whether a test was "Internal" or "Imported".

## User Story

As an educator or developer
I want to track the `sourceAssignmentId` of a psychometric test
So that I can distinguish between internal and imported tests, and eventually build an audit trail back to the raw answers.

## Problem Statement

Following a recent DDD refactor, the hard link between an `AssessmentAssignment` task and the clinical `PsychometricTest` result was removed. Currently, there is no way to accurately determine if a test in a student's health profile came from an internal system assignment or was imported manually.

## Solution Statement

Add a nullable `sourceAssignmentId` property to the `PsychometricTest` domain aggregate and its corresponding JPA entity. The `AssessmentScoringEngine` will be updated to attach this ID when generating the test objects. Finally, the DTOs and Frontend types will be updated to display a small indicator chip in the UI.

## Feature Metadata

**Feature Type**: Enhancement
**Estimated Complexity**: Low
**Primary Systems Affected**: Backend Domain (`PsychometricTest`, `AssessmentScoringEngine`), DTOs, Frontend UI (`PsychometricsTabContent`)
**Dependencies**: None

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/model/PsychometricTest.kt` - Why: The domain model that needs the new property.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/PsychometricTestEntity.kt` - Why: The JPA entity where `@Column(name = "source_assignment_id", nullable = true)` will be added.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentScoringEngine.kt` - Why: The engine that creates `PsychometricTest` instances during submission. Needs to accept and pass the assignment ID.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt` - Why: Calls the scoring engine, needs to pass `assignmentId` into it.
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/PsychometricsSummaryDto.kt` - Why: Backend DTO that delivers the test history to the frontend.
- `frontend/src/types/index.ts` or wherever `PsychometricsSummaryDto` / test types are stored - Why: Frontend interface needs `sourceAssignmentId?: number`.
- `frontend/src/components/assessments/PsychometricsTabContent.tsx` - Why: The UI component rendering the test results, which needs to show the "Internal" / "Imported" chip.

### New Files to Create

*No new files required.*

### Patterns to Follow

**Entity Mapping:**
Follow the existing Kotlin JPA conventions in `PsychometricTestEntity.kt`:
```kotlin
@Column(name = "source_assignment_id", nullable = true)
val sourceAssignmentId: Long? = null
```

**UI Material 3 Styling:**
Use standard Tailwind / M3 utility classes for the indicator chip in the frontend. E.g.
```tsx
{test.sourceAssignmentId ? (
  <span className="bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface-variant)] px-2 py-1 rounded-full text-xs">
    Internal
  </span>
) : (
  <span className="bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] px-2 py-1 rounded-full text-xs">
    Imported
  </span>
)}
```

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Domain & Persistence)

**Tasks:**
- Add `sourceAssignmentId: Long? = null` to the `PsychometricTest` domain model.
- Add `@Column(name = "source_assignment_id", nullable = true) val sourceAssignmentId: Long? = null` to `PsychometricTestEntity`.
- Update the mapping functions (if any exist between Entity and Model) to ensure `sourceAssignmentId` is mapped correctly in both directions.

### Phase 2: Core Implementation (Scoring Engine & Services)

**Tasks:**
- Update `AssessmentScoringEngine.scoreSection` (or similar factory methods) to accept `assignmentId: Long?` and inject it into the returned `PsychometricTest` instances.
- Update `AssessmentService.submitAssessment` to pass `assignment.id` into the scoring engine call.
- Fix any broken backend unit tests (e.g., `AssessmentScoringEngineTest.kt` or `AssessmentServiceTest.kt`) caused by the constructor changes.

### Phase 3: Integration (DTOs & Frontend)

**Tasks:**
- Update `PsychometricTestDto` in `backend/src/main/kotlin/com/medicalsystem/backend/dto/PsychometricsSummaryDto.kt` to include `val sourceAssignmentId: Long? = null`.
- Ensure the mapper that converts `PsychometricTest` to `PsychometricTestDto` copies this field.
- Update the frontend types to reflect `sourceAssignmentId?: number`.
- Update `PsychometricsTabContent.tsx` to conditionally render a small badge/chip showing "Internal" if `sourceAssignmentId` exists, else "Imported".

### Phase 4: Testing & Validation

**Tasks:**
- Run backend unit tests to verify the engine assigns the ID correctly.
- Verify frontend compilation with `npm run lint`.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/model/PsychometricTest.kt
- **IMPLEMENT**: Add `val sourceAssignmentId: Long? = null` to the data class.

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/entity/PsychometricTestEntity.kt
- **IMPLEMENT**: Add `@Column(name = "source_assignment_id", nullable = true) val sourceAssignmentId: Long? = null` to the entity.

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfile.kt
- **IMPLEMENT**: Ensure `sourceAssignmentId` is passed when converting `PsychometricTest` to `PsychometricTestEntity` (or vice versa). Check `StudentHealthProfile.kt`'s `recordAssessmentResult` method if it creates entities directly.

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentScoringEngine.kt
- **IMPLEMENT**: Add `assignmentId: Long?` to the signature of `scoreSection` or whichever method constructs the `PsychometricTest`.
- **IMPLEMENT**: Pass the `assignmentId` into the `PsychometricTest` constructor.

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt
- **IMPLEMENT**: In `submitAssessment`, pass `assignmentId` (or `savedAssignment.id`) to `AssessmentScoringEngine.scoreSection`.

### UPDATE backend/src/test/kotlin/...
- **IMPLEMENT**: Fix any broken unit tests in `AssessmentScoringEngineTest.kt` and `AssessmentServiceTest.kt` due to the updated method signatures.
- **VALIDATE**: `./mvnw test`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/dto/PsychometricsSummaryDto.kt
- **IMPLEMENT**: Add `val sourceAssignmentId: Long?` to `PsychometricTestDto`.
- **IMPLEMENT**: Find where `PsychometricTest` is mapped to `PsychometricTestDto` (likely in a Mapper or in `StudentService.kt`) and make sure the field is mapped.

### UPDATE frontend/src/types/index.ts
- **IMPLEMENT**: Add `sourceAssignmentId?: number;` to the correct test interface (e.g., inside `Student['psychometrics']` or wherever `PsychometricTestDto` is defined).

### UPDATE frontend/src/components/assessments/PsychometricsTabContent.tsx
- **IMPLEMENT**: Add conditional rendering for the "Internal" / "Imported" badge based on the presence of `sourceAssignmentId`.
- **VALIDATE**: `npm run lint`

---

## TESTING STRATEGY

### Unit Tests
- Backend tests should mock the submission and verify that the `sourceAssignmentId` is present on the resulting `PsychometricTest` entity.

### Edge Cases
- Older test records in the database will have a `null` value for `source_assignment_id`, which correctly defaults to "Imported" visually.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
`cd frontend && npm run lint`

### Level 2: Unit Tests
`cd backend && ./mvnw test`

### Level 4: Manual Validation
Boot up the stack with `docker compose up -d` or `./mvnw spring-boot:run` and `npm run dev`, submit a new test as a student, and verify the "Internal" badge shows up in the profile.

---

## ACCEPTANCE CRITERIA

- [ ] `sourceAssignmentId` exists in the database schema and is nullable.
- [ ] Test submission correctly tags the internal assignment ID to the clinical result.
- [ ] UI explicitly shows "Internal" or "Imported" based on the presence of this ID.
- [ ] All tests and builds pass.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Acceptance criteria all met
