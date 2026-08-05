# Feature: elevate-psychometric-test-to-entity

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Elevate `PsychometricTest` from a Domain Value Object to a pure Domain Entity. It currently lacks an identity (`id`) and contextual ownership (`studentId`) in the core domain model, despite being persisted as an entity via JPA (`PsychometricTestEntity`). This change rectifies the domain model to accurately reflect the true lifecycle and identity of a psychometric test.

## User Story

As a Backend Developer
I want to make PsychometricTest a true Domain Entity
So that the domain model accurately maps to the underlying database structure and individual tests can be uniquely identified.

## Problem Statement

Currently, `PsychometricTest` is defined as a `data class` without an `id` or `studentId` inside `DomainValueObjects.kt`. This makes it a Value Object in the pure domain layer. However, at the database and JPA layer (`PsychometricTestEntity`), it has an `id` and is tied to a `health_profile_id`. This creates a disconnect between the aggregate conceptual model and the persistence model. If we want to reference, update, or track a specific test reliably without relying solely on its values, it must have an identity.

## Solution Statement

1. Extract `PsychometricTest` from `DomainValueObjects.kt` into its own file (`PsychometricTest.kt`).
2. Add `id: Long? = null` and `studentId: Long` to the `PsychometricTest` class.
3. Update `StudentHealthProfileMapper.kt` to map the `id` in both `toModel` and `toEntity` conversions, and resolve the `studentId`.
4. Update `AssessmentScoringEngine.kt` and all relevant tests to pass the required identity/student arguments (or generate them correctly) when creating `PsychometricTest` instances.

## Feature Metadata

**Feature Type**: Refactor
**Estimated Complexity**: Low
**Primary Systems Affected**: Backend Domain Model, Mapping Layer, Assessment Engine
**Dependencies**: None

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/model/DomainValueObjects.kt` (lines 63-68) - Why: Contains the current `PsychometricTest` value object definition to be removed.
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentHealthProfileMapper.kt` (lines 28, 55) - Why: Needs to map the `id` and `studentId` properly between entity and model.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt` (lines 13-26) - Why: Constructs `PsychometricTest` instances and must be updated to handle the new constructor signature.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/PsychometricTestEntity.kt` - Why: The JPA entity to align with.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/model/PsychometricTest.kt` - The new domain entity file.

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- `GEMINI.md` - Why: General backend architecture and conventions (specifically regarding strict mapping and pure domain objects).

### Patterns to Follow

**Naming Conventions:** Domain models should reside in `com.medicalsystem.backend.model` and use PascalCase for class names.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation

**Tasks:**
- Create the new `PsychometricTest` entity in its own file in the `model` package.
- Remove the old definition from `DomainValueObjects.kt`.

### Phase 2: Core Implementation

**Tasks:**
- Update `StudentHealthProfileMapper.kt` to accurately map `id` and `studentId` when translating `toModel` and `toEntity`.

### Phase 3: Integration

**Tasks:**
- Update `AssessmentScoringEngine.kt` to pass `studentId` (meaning `scoreSection` will need `studentId` added to its signature, which cascades to callers). 
- Update all test files where `PsychometricTest` is constructed to include the new fields.

### Phase 4: Testing & Validation

**Tasks:**
- Run backend tests to verify mapping works and compilation succeeds.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/PsychometricTest.kt`
- **IMPLEMENT**: Create the `data class PsychometricTest(val id: Long? = null, val studentId: Long, val testType: PsychometricTestType, val score: Score, val testDate: LocalDate)`
- **IMPORTS**: `java.time.LocalDate`
- **VALIDATE**: `mvnw compile` (Note: will fail until step 2 and 3 are done)

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/DomainValueObjects.kt`
- **REMOVE**: Remove the `PsychometricTest` data class from lines 63-68.
- **VALIDATE**: None at this stage.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentHealthProfileMapper.kt`
- **IMPLEMENT**: In `toModel`, pass `id = testEntity.id` and `studentId = entity.studentId` to `PsychometricTest`. In `toEntity`, pass `id = testModel.id` to `PsychometricTestEntity`.
- **VALIDATE**: None at this stage.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt`
- **IMPLEMENT**: Modify `scoreSection` signature to include `studentId: Long`. Pass this `studentId` when returning the `PsychometricTest`.
- **VALIDATE**: None at this stage.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt` (Or wherever `scoreSection` is called)
- **IMPLEMENT**: Update the caller(s) of `AssessmentScoringEngine.scoreSection` to pass the `studentId`. Check `AssessmentService.kt` or `StudentRiskEvaluator.kt` depending on where it's invoked. Use `grep_search` to find `scoreSection` usages.
- **VALIDATE**: `mvnw compile`

### UPDATE Backend Tests
- **UPDATE**: `backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt` - Update `PsychometricTest` constructor calls to include dummy `studentId` and `id` if needed.
- **UPDATE**: `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentRiskEvaluatorTest.kt` - Update `PsychometricTest` constructor calls.
- **VALIDATE**: `./mvnw test`

---

## TESTING STRATEGY

### Unit Tests
Run existing mapping and evaluation tests to ensure they still pass with the new Entity fields.

### Integration Tests
Ensure the full test suite passes. JPA mapping is already correctly configured using `CascadeType.ALL`, so changing the Domain Model to retain the ID during bidirectional mapping is safe and will not break JPA.

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style
`cd backend && ./mvnw compile`

### Level 2: Unit Tests
`cd backend && ./mvnw test`

---

## ACCEPTANCE CRITERIA

- [ ] `PsychometricTest` is an independent domain entity in its own file.
- [ ] It contains `id` and `studentId` fields.
- [ ] `StudentHealthProfileMapper` maps these fields bidirectionally between Entity and Domain model.
- [ ] All tests compile and pass.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)

---

## NOTES

- The domain model `PsychometricTest` will have `id: Long?` to account for newly created tests that haven't been persisted yet.
- `studentId` is added directly to `PsychometricTest` because, as an Entity, it now conceptually exists as a child of a specific Aggregate Root (StudentHealthProfile/Student), giving it boundary context.
