# Feature: refactor-scoring-and-risk

## Executive Architectural Summary
This implementation plan was rigorously reviewed by both a **DDD Architect** and a **Clean Code Engineer**. 
- **DDD Review Score**: 5/10 (Initial plan violated aggregate boundaries by mutating the Health Profile directly from the Assessment Service).
- **Clean Code Score**: 7/10 (Initial plan missed an N+1 query performance trap and lacked edge case handling for empty test lists).

## Reconciliation & Trade-Off Log
- **Domain Decoupling**: Both reviewers strongly agreed that `AssessmentService` should NOT directly mutate `StudentHealthProfile`. We will restore Event-Driven orchestration (`AssessmentCompletedEvent`) so the Profile domain can update itself cleanly.
- **Ubiquitous Language**: `StudentRiskCalculator` will be renamed to `StudentRiskEvaluator` (medical professionals evaluate risk, they don't just calculate it).
- **Performance (N+1 Queries)**: Because risk is now dynamically derived, listing students would cause N+1 database queries to fetch tests. We traded lazy-loading for `@EntityGraph` eager loading on list queries to ensure high performance.
- **Empty State Fallbacks**: Evaluator will explicitly handle empty test lists, defaulting to `RiskStatus.LOW`.

---

## Feature Description
Refactor the architecture of Psychometric Assessments and Risk Calculation to align with Clean Code and DDD principles. This involves decoupling `PsychometricTest` from assignments into a standalone immutable `AssessmentRecord`-style entity and replacing static database-persisted risk scores with a dynamic, read-time pure function facade (`StudentRiskEvaluator`). 

## User Story
As a Developer
I want to extract test results into standalone entities and compute risk dynamically through a facade
So that tests can be easily imported from external systems, risk algorithms can be updated without DB migrations, and the scoring logic is cleanly isolated for future implementation.

## Feature Metadata
**Feature Type**: Refactor & Architectural Improvement
**Estimated Complexity**: Medium
**Primary Systems Affected**: `AssessmentScoringEngine`, `StudentHealthProfile`, `PsychometricTestEntity`, `AssessmentAssignment`, `AssessmentEventListener`

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/PsychometricTestEntity.kt` - Remove assignment dependency; enforce immutability.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentHealthProfileEntity.kt` - Remove `riskStatus`.
- `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEventListener.kt` - Must handle test orchestration cleanly.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt` - Needs to be gutted for TODO facades.

### New Files to Create
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentRiskEvaluator.kt` - Pure domain service.

---

## IMPLEMENTATION PLAN

### Phase 1: Foundation (The Facades)
- Create `StudentRiskEvaluator`. Handle empty states explicitly.
- Gut `AssessmentScoringEngine` logic and replace it with a `TODO("Implement real medical formula")` stub that returns safe baseline scores for compilation.

### Phase 2: Entity Refactoring
- Remove `riskStatus` from `StudentHealthProfileEntity`.
- Decouple `PsychometricTestEntity` from `AssessmentAssignmentEntity`. Make the entity fields strictly immutable (`val`).
- Introduce Double Dispatch on `StudentHealthProfile` model: `fun evaluateRisk(evaluator: StudentRiskEvaluator): RiskStatus`.

### Phase 3: Event-Driven Integration
- Ensure `AssessmentService` publishes `AssessmentCompletedEvent` containing the tests.
- Update `AssessmentEventListener` to catch the event, fetch the `StudentHealthProfile`, append the newly scored tests, and save the profile.

### Phase 4: Performance & Validation
- Prevent N+1 queries by adding `@EntityGraph(attributePaths = ["psychometricTests"])` to relevant `StudentHealthProfileRepository` list fetch queries.
- Fix broken unit tests and write specific tests for empty states and N+1 regressions.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom.

### 1. CREATE `StudentRiskEvaluator.kt`
- **IMPLEMENT**: Create `@Service` `StudentRiskEvaluator`.
- **IMPLEMENT**: Add pure function `fun evaluate(tests: List<PsychometricTest>): RiskStatus`.
- **IMPLEMENT**: Handle empty states: `if (tests.isEmpty()) return RiskStatus.LOW`. Otherwise, return `TODO("Implement actual risk algorithm")` or `RiskStatus.LOW`.

### 2. REFACTOR `AssessmentScoringEngine.kt`
- **IMPLEMENT**: Replace logic in `scoreSection` with dummy logic and `TODO` comments.

### 3. UPDATE Entity Schema & Immutability
- **UPDATE** `PsychometricTestEntity.kt`: Remove `@ManyToOne var assignment: AssessmentAssignmentEntity?`. Convert `var` fields to `val` where possible for immutability.
- **UPDATE** `AssessmentAssignmentEntity.kt`: Remove `@OneToMany val tests`.
- **UPDATE** `StudentHealthProfileEntity.kt`: Remove `riskStatus` column.

### 4. UPDATE Domain Models and Mappers
- **UPDATE** `StudentHealthProfile.kt`: Add `fun evaluateRisk(evaluator: StudentRiskEvaluator) = evaluator.evaluate(this.psychometricTests)`. Remove the `riskStatus` property.
- **UPDATE** `StudentHealthProfileMapper.kt`: Remove direct `riskStatus` mapping. If required for DTO output, inject the evaluator.

### 5. REFACTOR `AssessmentEventListener.kt`
- **IMPLEMENT**: Update the listener. On `AssessmentCompletedEvent`, fetch the student's `StudentHealthProfileEntity` and append the new `PsychometricTestEntity` records directly to its collection.

### 6. FIX N+1 Query Traps
- **UPDATE** `StudentHealthProfileRepository.kt`: Any custom `@Query` that fetches multiple profiles must be annotated with `@EntityGraph(attributePaths = ["psychometricTests"])`.

### 7. FIX TESTS & VALIDATION
- **IMPLEMENT**: Fix compilation errors in all tests.
- **IMPLEMENT**: Write `StudentRiskEvaluatorTest` to prove the empty list fallback works.
- **VALIDATE**: `./mvnw clean test`

---

## VALIDATION COMMANDS

### Level 1: Unit Tests
`./mvnw clean test`

### Level 2: Boot Run Check (Database Schema Validation)
`./mvnw spring-boot:run`
