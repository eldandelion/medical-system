# Feature: robust-assessment-api

The following plan should be complete, but its important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils types and models. Import from the right files etc.

## Feature Description

Refactor the Assessment Submission API and frontend data structures to use strict, strongly-typed contracts. This prevents silent runtime index shifting errors (e.g., missing `phq9_9` due to 0-based indexing) by moving validation to the compiler level on the frontend, and providing explicit DTOs, domain-level bounds validation, and structured RFC-7807 style error responses on the backend.

## User Story

As a Developer and Student
I want to interact with a strictly typed, fully validated assessment submission API
So that my clinical data is perfectly aligned, bug-free, and I get exact feedback on which questions I missed.

## Problem Statement

Currently, the backend accepts an opaque `Map<String, Int>` for assessment submission and returns a generic String error inside a 400 Bad Request when validation fails. The frontend mock data uses strings and objects without required IDs, falling back to brittle 0-based array index calculation that causes critical clinical data shifts and missing final questions.

## Solution Statement

1. **Frontend Type Strictness**: Make `id` required in `Question` and eliminate the `string | Question` union in `AssessmentData.ts`. Generate `id`s automatically using a builder function.
2. **Explicit DTOs**: Replace `Map<String, Int>` with `List<AnswerSubmissionDto>` in `SubmitAssessmentRequest`.
3. **Structured Errors**: Introduce `AssessmentValidationException` and handle it in `GlobalExceptionHandler` to return structured JSON detailing missing or out-of-bounds keys.
4. **Required Keys Payload**: Include `requiredQuestionIds` on `AssessmentDetailsDto` so the frontend knows exactly what is expected.

## Feature Metadata

**Feature Type**: Refactor / Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: Backend API (`AssessmentController`, `AssessmentScoringEngine`, DTOs), Frontend `AssessmentFlow`, `AssessmentData.ts`
**Dependencies**: None new

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDto.kt` - Why: Needs new `AnswerSubmissionDto` and updates to `SubmitAssessmentRequest` and `AssessmentDetailsDto`.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt` - Why: Validation logic needs to accumulate all missing/invalid keys and throw a structured exception.
- `backend/src/main/kotlin/com/medicalsystem/backend/exception/GlobalExceptionHandler.kt` - Why: Needs to catch `AssessmentValidationException` and return a structured JSON (like `missingQuestionIds`).
- `frontend/src/components/assessments/AssessmentData.ts` - Why: `Question` interface must require `id: string`. The static arrays must be wrapped in a helper to generate these IDs natively.
- `frontend/src/components/assessments/AssessmentFlow.tsx` - Why: Needs to stop using `index + 1` fallbacks and submit an array of objects to the backend API.

### New Files to Create

- `backend/src/main/kotlin/com/medicalsystem/backend/exception/AssessmentValidationException.kt` - Domain exception with lists for missing and out-of-bounds keys.

---

## IMPLEMENTATION PLAN

### Phase 1: Backend Domain & DTO Foundation

**Tasks:**
- Define `AssessmentValidationException` to hold `missingKeys` and `invalidKeys`.
- Update `GlobalExceptionHandler` to map this exception to a 400 response with `"missingKeys"` arrays in the JSON body.
- Update `SubmitAssessmentRequest` to use `val answers: List<AnswerSubmissionDto>`.
- Add `val requiredQuestionIds: List<String>` to `AssessmentDetailsDto`.

### Phase 2: Core Scoring Engine Refactor

**Tasks:**
- Refactor `AssessmentScoringEngine.validateAnswers` to take `List<AnswerSubmissionDto>`, map it internally, and accumulate ALL missing and out-of-bounds errors before throwing `AssessmentValidationException`.
- Ensure `AssessmentService` maps the new DTO correctly into the scoring engine.
- Inject `AssessmentScaleCatalog.getScale(scaleType).allQuestionIds` into `AssessmentDetailsDto` inside `AssessmentService.getAssessmentDetails`.

### Phase 3: Frontend Interface & Mock Data Refactor

**Tasks:**
- Update `AssessmentData.ts`:
  - `Question` requires `id: string`.
  - `AssessmentSection` requires `questions: Question[]`.
  - Create `export function defineSection(...)` that maps the shorthand syntax (strings) into strict `Question` objects with `1-based` ids (e.g. `phq9_1`).
  - Wrap all existing arrays (e.g., `MENTAL_HEALTH_ASSESSMENT`) with `defineSection`.

### Phase 4: Frontend Integration & Validation

**Tasks:**
- Update `AssessmentFlow.tsx` and `types/index.ts` to expect `requiredQuestionIds` and submit `List<{ questionId, selectedValue }>`.
- Remove the `getQuestionKey` fallback logic in `AssessmentFlow.tsx`; directly use `question.id`.
- Update `showSnackbar` error handling to parse the backend's structured `missingKeys` if available.
- Update MSW handlers in `handlers.test.ts` / `handlers.ts` to match the new DTO structures.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### 1. CREATE `backend/src/main/kotlin/com/medicalsystem/backend/exception/AssessmentValidationException.kt`
- **IMPLEMENT**: Create `class AssessmentValidationException(val missingKeys: List<String>, val invalidKeys: List<String>) : RuntimeException()`

### 2. UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/exception/GlobalExceptionHandler.kt`
- **IMPLEMENT**: Add `@ExceptionHandler` for `AssessmentValidationException`. Return `ResponseEntity.status(400)` with a map containing `"error"`, `"missingKeys"`, and `"invalidKeys"`.
- **VALIDATE**: `./mvnw test`

### 3. UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDto.kt`
- **IMPLEMENT**: Create `data class AnswerSubmissionDto(val questionId: String, val selectedValue: Int)`.
- **IMPLEMENT**: Update `SubmitAssessmentRequest` to use `val answers: List<AnswerSubmissionDto>`.
- **IMPLEMENT**: Add `val requiredQuestionIds: List<String>` to `AssessmentDetailsDto`.
- **VALIDATE**: `./mvnw compile`

### 4. UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt`
- **IMPLEMENT**: Refactor `validateAnswers` and `score` to accept `List<AnswerSubmissionDto>` instead of `Map<String, Int>`.
- **IMPLEMENT**: Convert to map internally (`answers.associate { it.questionId to it.selectedValue }`). Accumulate missing keys and invalid bounds, then throw `AssessmentValidationException` if lists are not empty.
- **VALIDATE**: `./mvnw test`

### 5. UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt` & `AssessmentController.kt`
- **IMPLEMENT**: Ensure compilation passes with DTO changes. Pass `answers` list directly to `ScoringEngine`.
- **IMPLEMENT**: In `getAssessmentDetails`, populate `requiredQuestionIds = AssessmentScaleCatalog.getScale(assignment.scaleType).allQuestionIds`.
- **VALIDATE**: `./mvnw test`

### 6. UPDATE `frontend/src/components/assessments/AssessmentData.ts`
- **IMPLEMENT**: Remove optional `?` from `Question.id`.
- **IMPLEMENT**: Change `AssessmentSection.questions` to `Question[]`.
- **IMPLEMENT**: Add `defineSection` wrapper function to auto-assign `id` based on `1-based` array index. Map over all exports like `MENTAL_HEALTH_ASSESSMENT` applying `defineSection`.

### 7. UPDATE `frontend/src/types/index.ts`
- **IMPLEMENT**: Update `AssessmentDetails` interface to include `requiredQuestionIds: string[]`.
- **IMPLEMENT**: Update `SubmitAssessmentRequest` interface to match `answers: { questionId: string, selectedValue: number }[]`.

### 8. UPDATE `frontend/src/components/assessments/AssessmentFlow.tsx`
- **IMPLEMENT**: Remove 0-based key fallbacks (`${section.id}_${index}`). Always use `question.id`.
- **IMPLEMENT**: Map the local `answers` dictionary to the new array structure on submit: `answers: Object.entries(answers).map(([questionId, selectedValue]) => ({ questionId, selectedValue }))`.
- **VALIDATE**: `npm run lint`

### 9. UPDATE MSW Mocks (`frontend/src/mocks/handlers.ts` & `handlers.test.ts`)
- **IMPLEMENT**: Ensure MSW mock payloads for `GET /api/assessments/:id` return `requiredQuestionIds`. Ensure `POST` handles the array syntax.
- **VALIDATE**: `npm run test`

---

## VALIDATION COMMANDS

Execute every command to ensure zero regressions and 100% feature correctness.

### Level 1: Syntax & Style
`cd frontend && npm run lint`

### Level 2: Backend Unit Tests
`cd backend && ./mvnw test`

### Level 3: Frontend Unit Tests
`cd frontend && npm run test`

---

## ACCEPTANCE CRITERIA

- [ ] Backend accepts `List<AnswerSubmissionDto>` instead of generic maps.
- [ ] Backend throws structured `AssessmentValidationException`.
- [ ] Backend returns `requiredQuestionIds` upon assessment fetch.
- [ ] Frontend strictly typing `Question.id` and building IDs elegantly without union types.
- [ ] MSW Tests pass.
- [ ] Spring Boot tests pass.
