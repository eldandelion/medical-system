# Feature: Assessment Progress Tracking & Auto-Save

The following plan provides detailed, context-rich tasks to implement debounced background progress saving. This plan has been hardened via Architectural Review to strictly adhere to Domain-Driven Design and Clean Code principles.

## Feature Description
Allows students to continuously save their in-progress psychometric assessments. Uses a custom React hook with debounced background syncing (and unmount flushing) so progress isn't lost on refresh or connection drops. The backend `AssessmentAssignment` aggregate natively calculates its own progress percentage and guards its own invariants.

## User Story
As a student
I want my answers to be automatically saved as I progress through an assessment
So that my progress is not lost if my internet disconnects or I accidentally refresh the page

## Problem Statement
Currently, students must complete an entire assessment and submit it in one go. If they lose connection, their progress is wiped. The system needs a lightweight, behavior-rich way to store and track partial progress.

## Solution Statement
We will reuse the existing `answers_json` mapping on `AssessmentAssignment`.
- **Backend (DDD)**: `AssessmentAssignment` will expose `recordProgress()` and `calculateProgress()`, encapsulating invariants.
- **Frontend (Clean Code)**: A new `useRecordProgress` custom hook will wrap a TanStack `useMutation` to handle debouncing, unmount flushing, and error UI, decoupling API concerns from the `AssessmentFlow.tsx` UI component.

## Feature Metadata
**Feature Type**: Enhancement
**Estimated Complexity**: Medium
**Primary Systems Affected**: `AssessmentAssignment`, `AssessmentController`, `AssessmentService`, `AssessmentFlow.tsx`, `useRecordProgress.ts`

---

## CONTEXT REFERENCES

### Relevant Codebase Files
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt` - Why: The aggregate root where invariants and percentage calculations must live.
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/AssessmentController.kt` (lines 58-67) - Why: Existing submit pattern we'll mirror for the new `/progress` endpoint.
- `frontend/src/components/assessments/AssessmentFlow.tsx` (lines 43-74) - Why: Initial data fetch logic where we restore `savedAnswers`.

---

## IMPLEMENTATION PLAN

### Phase 1: Domain Modeling & DTOs
**Tasks:**
- Add `recordProgress` and `calculateProgress` behaviors to `AssessmentAssignment.kt`.
- Create a symmetric `RecordProgressRequest` DTO taking `Map<String, Int>`.
- Add `savedAnswers` to `AssessmentDetailsDto` and utilize the new domain methods in `AssessmentMapper.kt`.

### Phase 2: Backend Service & Endpoints
**Tasks:**
- Add `recordProgress` to `AssessmentService.kt`, delegating to the aggregate.
- Expose `PUT /api/assessments/{id}/progress` in `AssessmentController.kt`.

### Phase 3: Frontend Custom Hook & MSW Mocks
**Tasks:**
- Add an MSW handler for `PUT /api/assessments/:id/progress`.
- Create `hooks/useRecordProgress.ts` wrapping `useMutation` with debouncing and unmount flushing.

### Phase 4: Frontend UI Integration
**Tasks:**
- Update `AssessmentFlow.tsx` to initialize state from `savedAnswers` and utilize the `useRecordProgress` hook.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDto.kt`
- **IMPLEMENT**: Add `val savedAnswers: Map<String, Int>?` to `AssessmentDetailsDto`.
- **IMPLEMENT**: Add a new data class `RecordProgressRequest(val answers: Map<String, Int>)`.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt`
- **IMPLEMENT**: Add domain method:
  ```kotlin
  fun recordProgress(newAnswers: Map<String, Int>, currentUserId: Long) {
      if (this.studentId != currentUserId) throw ForbiddenException("You can only record progress for your own assessments")
      if (this.status != AssessmentStatus.PENDING) throw IllegalStateException("Cannot record progress for a non-pending assessment")
      this.answers = newAnswers
  }
  ```
- **IMPLEMENT**: Add progress calculation:
  ```kotlin
  fun calculateProgress(totalQuestions: Int): Int {
      if (this.status == AssessmentStatus.COMPLETED) return 100
      val safeTotal = if (totalQuestions > 0) totalQuestions else 1
      val answered = this.answers?.size ?: 0
      return ((answered.toDouble() / safeTotal) * 100).toInt()
  }
  ```

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentMapper.kt`
- **IMPLEMENT**: In `toListItemDto`, change `val percentage = ...` to `val percentage = this.calculateProgress(scale?.totalQuestions ?: 1)`.
- **IMPLEMENT**: In `toDetailsDto`, add `savedAnswers = assignment.answers` to the returned `AssessmentDetailsDto`.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt`
- **IMPLEMENT**: Add `fun recordProgress(assignmentId: Long, request: RecordProgressRequest, currentUser: User)`.
- **IMPLEMENT**: Fetch the assignment via `findById`.
- **IMPLEMENT**: Call `assignment.recordProgress(request.answers, currentUser.id)`.
- **IMPLEMENT**: Call `assignmentRepository.save(assignment)`.

### UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/controller/AssessmentController.kt`
- **IMPLEMENT**: Add a `@PutMapping("/{id}/progress")` endpoint calling `assessmentService.recordProgress()`.

### UPDATE `frontend/src/mocks/handlers.ts`
- **IMPLEMENT**: Add `http.put('/api/assessments/:id/progress', ...)` returning a simple `{ success: true }` JSON response.

### CREATE `frontend/src/hooks/useRecordProgress.ts`
- **IMPLEMENT**: Export a custom hook `useRecordProgress(assessmentId: string | undefined, answers: Record<string, number>)`.
- **IMPLEMENT**: Use React Query's `useMutation` to fire the `PUT` request using `session.token`.
- **IMPLEMENT**: Implement a `useEffect` that sets a 2000ms timeout whenever `answers` change. When it fires, call `mutation.mutate()`.
- **GOTCHA**: Ensure the `useEffect` returns a cleanup function that `clearTimeout`s.
- **GOTCHA**: On component unmount, if a timeout was pending, synchronously flush the save (e.g., using a ref to track the latest answers and a sync fetch call, or simply firing the mutation if safe to do so).

### UPDATE `frontend/src/components/assessments/AssessmentFlow.tsx`
- **IMPLEMENT**: In the fetch success block, add `if (data.savedAnswers) { setAnswers(data.savedAnswers); }`.
- **IMPLEMENT**: Invoke the `useRecordProgress(assessmentId, answers)` hook.
- **IMPLEMENT**: If `useRecordProgress` exposes an error state, use `SnackbarContext` to notify the user: "保存进度失败，请检查网络".

---

## TESTING STRATEGY

### Unit Tests (Backend)
Update `AssessmentAssignmentTest.kt` (or create it) to verify `recordProgress` throws appropriate exceptions and `calculateProgress` handles edge cases (0 total questions, partial, full).

### Unit Tests (Frontend)
Use `vi.useFakeTimers()` in `useRecordProgress.test.ts` to ensure debouncing only fires one API call for rapid sequential answer updates, and that unmounting flushes pending saves.

---

## VALIDATION COMMANDS

### Level 1: Backend Tests
`./mvnw clean test`

### Level 2: Frontend Tests & Lint
`cd frontend && npm run test`
`cd frontend && npm run lint`

---

## ACCEPTANCE CRITERIA
- [ ] Domain logic (invariants, percentage) is securely encapsulated in `AssessmentAssignment`.
- [ ] API contract is perfectly symmetric (`Map<String, Int>`).
- [ ] Frontend strictly separates UI rendering from debounced API mutation side effects.
- [ ] Missing internet connection causes a user-visible fallback error alert.
- [ ] Navigating away (unmounting) synchronously captures the final draft state.
- [ ] All validation commands pass.
