# Feature: Refactor Assessment Service

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Refactor `AssessmentService.kt` to resolve architectural violations, critical performance bottlenecks (N+1 queries and in-memory filtering), and code quality issues (magic strings, time dependency) identified during the Architect Plan Review.

## User Story

As a System Maintainer
I want to refactor the AssessmentService
So that it adheres to strict DDD principles, runs performantly for large cohorts, and eliminates presentation logic from the backend.

## Problem Statement

`AssessmentService.kt` currently suffers from:
1. **Performance Bottlenecks:** `assignToCohort` filters students in-memory and executes database queries inside a loop (N+1).
2. **Aggregate Coupling:** `submitAssessment` synchronously modifies both `AssessmentAssignment` and `StudentHealthProfile` inside the same transaction.
3. **Magic Strings:** Hardcoded Chinese strings ("心理中心", "测试") and magic statuses ("LOW") leak presentation logic into the domain layer.
4. **Time Coupling:** Hardcoded `LocalDateTime.now()` makes boundary testing impossible.

## Solution Statement

We will refactor the service into three distinct phases:
1. Clean Code & Decoupling (extract constants, inject `java.time.Clock`, extract DTO mappers).
2. Performance Optimization (push cohort filtering to a Spring Data `JpaSpecification` and use bulk pending checks).
3. DDD Realignment (decouple `submitAssessment` using a `@TransactionalEventListener` and Spring Data `@DomainEvents`).

## Feature Metadata

**Feature Type**: Refactor
**Estimated Complexity**: Medium
**Primary Systems Affected**: `AssessmentService`, `AssessmentAssignment` Aggregate, `StudentHealthProfile` Entity
**Dependencies**: Spring Data JPA, Spring ApplicationEvents

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt` - Why: The primary target of this refactor.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfileFactory.kt` - Why: Contains the magic string `"LOW"` that needs replacing.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/RiskStatus.kt` - Why: Provides the proper `RiskStatus` enum.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepository.kt` - Why: Needs new bulk queries (e.g. `findByStudentIdInAndScaleTypeIn`).
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/StudentRepository.kt` - Why: Needs to execute the `JpaSpecification`.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentMapper.kt` - Extension functions for mapping entities/domain models to DTOs.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentCohortSpecification.kt` - The JPA specification for filtering cohorts.
- `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListener.kt` - The transactional event listener for profile updates.
- `backend/src/main/kotlin/com/medicalsystem/backend/config/ClockConfig.kt` - Configuration to provide a `java.time.Clock` bean.

### Patterns to Follow

**DTO Mapping**: Use Kotlin extension functions: `fun AssessmentScale.toDetailsDto(): AssessmentDetailsDto`
**Time Handling**: Inject `private val clock: Clock` via constructor.
**Event Handling**: Use `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` to react to domain events.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (Clean Code)

**Tasks:**
- Provide a `Clock` bean globally.
- Inject `Clock` into `AssessmentService` and replace `LocalDateTime.now()`.
- Extract hardcoded strings ("心理中心", "测试", "问卷测评提交成功") to a constants object or handle them purely in DTO factory extensions.
- Replace `"LOW"` with `RiskStatus.LOW.name` in `StudentHealthProfileFactory`.
- Extract mapping logic from `getAssessmentDetails` and `getCatalog` into `AssessmentMapper.kt`.

### Phase 2: Integration & Performance (Cohort Filtering)

**Tasks:**
- Create `AssessmentCohortSpecification` implementing `Specification<StudentEntity>`.
- Add `findByStudentIdInAndScaleType` (or similar bulk query) to `AssessmentAssignmentRepository`.
- Refactor `assignToCohort` to use the specification and bulk pending check instead of in-memory filtering.

### Phase 3: DDD Realignment (Eventual Consistency)

**Tasks:**
- Refactor `AssessmentAssignment` to extend `AbstractAggregateRoot` (if not already) so `save()` automatically publishes events.
- Remove `eventPublisher.publish(it)` manual loops from `AssessmentService`.
- Create `AssessmentCompletedListener` to listen for `AssessmentCompletedEvent`.
- Move the `StudentHealthProfile` creation and `recordAssessmentResult` logic out of `submitAssessment` and into the new listener.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE backend/src/main/kotlin/com/medicalsystem/backend/config/ClockConfig.kt
- **IMPLEMENT**: Create a `@Configuration` class that defines a `@Bean fun clock(): Clock = Clock.systemDefaultZone()`.
- **VALIDATE**: `./mvnw clean test-compile`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfileFactory.kt
- **IMPLEMENT**: Replace hardcoded `"LOW"` string with `RiskStatus.LOW.name`.
- **IMPORTS**: Ensure `com.medicalsystem.backend.model.RiskStatus` is imported.
- **VALIDATE**: `./mvnw test -Dtest=StudentHealthProfileFactoryTest` (or similar).

### CREATE backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentMapper.kt
- **IMPLEMENT**: Extract DTO mappers from `AssessmentService`. Add extension functions: `fun AssessmentScale.toCatalogItemDto(): AssessmentCatalogItemDto`, etc. Also encapsulate the `assignerName ?: "心理中心"` logic here.
- **VALIDATE**: `./mvnw clean test-compile`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt (Phase 1)
- **IMPLEMENT**: Inject `private val clock: Clock`. Replace all `LocalDateTime.now()` with `LocalDateTime.now(clock)`. Utilize the new `AssessmentMapper` extension functions to clean up query methods.
- **VALIDATE**: `./mvnw test -Dtest=AssessmentServiceTest`

### CREATE backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentCohortSpecification.kt
- **IMPLEMENT**: Create JPA Specification for `StudentEntity` filtering by `majorId`, `collegeId`, `academicYear`, and ensuring visibility criteria.
- **VALIDATE**: `./mvnw clean test-compile`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepository.kt
- **IMPLEMENT**: Add bulk query: `fun findPendingByStudentIdInAndScaleType(studentIds: List<Long>, scaleType: String): List<AssessmentAssignment>`
- **VALIDATE**: `./mvnw clean test-compile`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt (Phase 2)
- **IMPLEMENT**: Refactor `assignToCohort` to use `AssessmentCohortSpecification` (via `studentRepository.findAll(spec)`) and the new bulk repository query to prevent N+1.
- **VALIDATE**: `./mvnw test -Dtest=AssessmentServiceTest`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt
- **IMPLEMENT**: Ensure it extends `AbstractAggregateRoot<AssessmentAssignment>` and registers events using `registerEvent()`.
- **VALIDATE**: `./mvnw clean test-compile`

### CREATE backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListener.kt
- **IMPLEMENT**: Create a `@Component` with a `@TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` listening for `AssessmentCompletedEvent`. Move the `studentHealthProfileRepository` interaction here.
- **IMPORTS**: Require `StudentHealthProfileRepository`.
- **VALIDATE**: `./mvnw clean test-compile`

### UPDATE backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt (Phase 3)
- **IMPLEMENT**: Remove `studentHealthProfileRepository` dependency. Simplify `submitAssessment` to only update the assignment and save it. Remove `saved.getDomainEvents().forEach(...)` loops if Spring `@DomainEvents` handles them now.
- **VALIDATE**: `./mvnw test -Dtest=AssessmentServiceTest`

---

## TESTING STRATEGY

### Unit Tests
- Create or update `AssessmentServiceTest` mocking the `Clock`, `UserRepository`, `AssessmentAssignmentRepository`, etc.
- Verify that `assignToCohort` behaves identically logically but executes fewer repository calls.

### Integration Tests
- Verify that `AssessmentCompletedListener` fires successfully after an assignment is submitted, and the database transaction successfully persists the `StudentHealthProfile`.

### Edge Cases
- Test cohort assignment with an empty cohort (ensure no SQL constraint errors).
- Test duplicate assignment assignment attempts (ensure bulk check correctly filters out already pending assignments).

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
`./mvnw checkstyle:check`

### Level 2: Unit Tests
`./mvnw test -Dtest=AssessmentServiceTest`
`./mvnw test -Dtest=AssessmentCompletedListenerTest`

### Level 3: Integration Tests
`./mvnw test` (Run full suite to catch any regressions across the DDD boundary).

---

## ACCEPTANCE CRITERIA

- [ ] `AssessmentService.kt` no longer contains Chinese strings or `"LOW"` hardcodes.
- [ ] `assignToCohort` uses a `JpaSpecification` and executes a bulk query instead of N+1 `findPendingBy...`.
- [ ] `submitAssessment` modifies only the `AssessmentAssignment`. Profile updating is handled via an Event Listener.
- [ ] All unit and integration tests pass.
- [ ] `java.time.Clock` is properly injected.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No regressions in existing functionality
