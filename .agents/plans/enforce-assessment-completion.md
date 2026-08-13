# Feature: Enforce Assessment Completion Validation

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

This feature adds mandatory validation to the assessment submission flow on both the frontend UI and the backend API. It prevents users from successfully submitting an assessment if there are any unanswered questions or if invalid question codes are submitted.

## User Story

As a user taking an assessment
I want to be prevented from submitting if I missed any questions
So that my health profile accurately reflects complete psychometric data and no partial tests are incorrectly scored.

## Problem Statement

Currently, the `AssessmentFlow.tsx` frontend component allows users to jump to the last question via the sidebar and click "Finish" to submit the assessment without completing prior questions. Furthermore, the backend `AssessmentScoringEngine.kt` delegates validation to a stubbed `validateAnswers` method containing a `TODO`, allowing incomplete or invalid answer sets to bypass validation and be saved.

## Solution Statement

1. **Frontend**: Update `AssessmentFlow.tsx` to strictly check if the number of answered questions equals the total number of questions before allowing the `submitAssessment` API call. Show an alert (Snackbar) to the user if they attempt to submit with missing answers. Extract magic strings to a constant outside the render cycle.
2. **Backend**: Implement the missing `validateAnswers` logic in `AssessmentScoringEngine.kt` to compare the submitted question codes against the `AssessmentScale.allQuestionCodes` property. Validate both for missing question codes (incomplete test) and invalid question codes (tampered payload).

## Feature Metadata

**Feature Type**: Enhancement / Bug Fix
**Estimated Complexity**: Low
**Primary Systems Affected**: Frontend (`AssessmentFlow`), Backend (`AssessmentScoringEngine`)
**Dependencies**: None

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `frontend/src/components/assessments/AssessmentFlow.tsx` (lines 117-173) - Why: Contains the `submitAssessment` and `handleNext` logic.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt` (lines 8-11) - Why: Contains the `validateAnswers` stub that needs to be implemented.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScale.kt` (lines 45-47) - Why: Defines `allQuestionCodes`, a helper to get all expected keys.
- `backend/src/main/kotlin/com/medicalsystem/backend/exception/AssessmentValidationException.kt` - Why: The exception type to be thrown upon validation failure.
- `backend/src/main/kotlin/com/medicalsystem/backend/exception/GlobalExceptionHandler.kt` - Why: Contains the serialization logic for `AssessmentValidationException`.

### New Files to Create

None.

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- `GEMINI.md` - Read the Error Handling practices for both Frontend (Snackbar) and Backend (`@RestControllerAdvice`).

### Patterns to Follow

**Error Handling:**
- Throw `AssessmentValidationException` on the backend, initializing it with `missingKeys` and `invalidKeys`.
- On the frontend, catch errors using standard `try/catch` around fetch calls, rely on backend's formatted 400 Bad Request which returns `missingKeys` and `invalidKeys` arrays, and trigger `showSnackbar`.

---

## IMPLEMENTATION PLAN

### Executive Architectural Summary
This plan was hardened through an Architect Review. 
- **DDD Adjustments**: We clarified the Ubiquitous Language internally in the backend (using `missingQuestionCodes` and `invalidQuestionCodes` in the domain logic instead of generic "keys"). 
- **Clean Code Adjustments**: We removed a frontend magic string, added validation for invalid/tampered payloads (not just missing ones), and defined a robust testing strategy across both UI and Domain layers.
- **Trade-off Log**: We opted to keep validation within the stateless `AssessmentScoringEngine` pure domain service (rather than migrating it into the Aggregate Root `Assessment` or an `AssessmentAnswers` Value Object) because the stub already exists and aligns cleanly with the current architecture's delegation pattern.

### Phase 1: Backend Validation Core Implementation

**Tasks:**
- Implement `validateAnswers` in `AssessmentScoringEngine.kt`.
- Calculate `missingQuestionCodes` (`scale.allQuestionCodes - answers.keys`) and `invalidQuestionCodes` (`answers.keys - scale.allQuestionCodes`).
- If either set is non-empty, throw `AssessmentValidationException(missingKeys = missingQuestionCodes.toList(), invalidKeys = invalidQuestionCodes.toList())`.

### Phase 2: Frontend Validation

**Tasks:**
- Extract the validation message to a constant (`const INCOMPLETE_ASSESSMENT_MSG = '请先完成所有题目后再提交';`) outside the component.
- Modify `handleNext` in `AssessmentFlow.tsx` to prevent submission if `answeredCount < totalQuestions`. Trigger the Snackbar with the constant message and return early.

### Phase 3: Testing & Validation

**Tasks:**
- Add isolated unit tests for `AssessmentScoringEngine` covering valid payloads, missing codes, and invalid codes.
- Add frontend tests in `AssessmentFlow.test.tsx` verifying that clicking "Finish" with incomplete answers triggers a Snackbar and halts the API call.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### 1. UPDATE backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt

- **IMPLEMENT**: Replace the `TODO` inside `validateAnswers`. Calculate `val missingQuestionCodes = scale.allQuestionCodes - answers.keys` and `val invalidQuestionCodes = answers.keys - scale.allQuestionCodes`. If either is non-empty, throw `AssessmentValidationException`.
- **PATTERN**: Use `scale.allQuestionCodes` and Kotlin set operations (`-`). 
- **VALIDATE**: `./mvnw compile`

### 2. CREATE backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt

- **IMPLEMENT**: Add unit tests for `validateAnswers`. Include cases for: Happy Path (exact match), Missing Answers (1 and multiple), and Invalid Answers (keys not in scale).
- **VALIDATE**: `./mvnw test -Dtest=AssessmentScoringEngineTest`

### 3. UPDATE frontend/src/components/assessments/AssessmentFlow.tsx

- **IMPLEMENT**: Define `const INCOMPLETE_ASSESSMENT_MSG = '请先完成所有题目后再提交';` outside the component. Update the `handleNext` function: `if (answeredCount < totalQuestions) { showSnackbar({ message: INCOMPLETE_ASSESSMENT_MSG, duration: 3000 }); return; }`.
- **IMPORTS**: Ensure `showSnackbar` from `useSnackbar` is accessible within `handleNext`.
- **VALIDATE**: `npm run lint` inside the `/frontend` directory.

### 4. UPDATE frontend/src/components/assessments/AssessmentFlow.test.tsx (if exists, or create)

- **IMPLEMENT**: Add a test asserting that clicking the submit/finish button when answers are incomplete calls the snackbar function and does not call the fetch/submit API.
- **VALIDATE**: `npm run test -- AssessmentFlow` inside `/frontend`.

---

## TESTING STRATEGY

### Unit Tests
- Backend domain logic must be tested in isolation in `AssessmentScoringEngineTest.kt`.
- Frontend logic must be tested using Testing Library in `AssessmentFlow.test.tsx` to assert UI behavior without mounting the entire app.

### Edge Cases
- **Bypass through Sidebar**: Frontend user clicks directly on the final question in the sidebar, answers it, and clicks 'Finish'. The frontend `answeredCount < totalQuestions` check should immediately reject it.
- **Direct API Call / Tampered Payload**: An attacker crafts a raw cURL request bypassing the frontend check with incomplete `answers` or extra invalid fields. The backend `AssessmentScoringEngine` will reject it, throwing `AssessmentValidationException`. `GlobalExceptionHandler` translates this to a 400 Bad Request with `missingKeys` and `invalidKeys` arrays.

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style
`cd frontend && npm run lint`

### Level 2: Unit Tests
`./mvnw test` (Backend)
`cd frontend && npm run test` (Frontend)

---

## ACCEPTANCE CRITERIA

- [ ] A user cannot click "Finish" to trigger `submitAssessment` in `AssessmentFlow.tsx` if questions remain unanswered.
- [ ] Attempting to submit an incomplete assessment on the frontend shows a snackbar message (using a declared constant, no magic strings).
- [ ] Submitting an incomplete assessment payload directly to the backend API endpoint results in a 400 Bad Request.
- [ ] Submitting a payload with invalid question codes results in a 400 Bad Request.
- [ ] The `AssessmentValidationException` correctly carries the list of missing and invalid keys.
- [ ] Backend unit tests and frontend component tests pass.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors
- [ ] Manual testing confirms feature works
- [ ] Acceptance criteria all met
