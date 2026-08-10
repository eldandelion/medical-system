# Feature: Assessment Frontend UX Fixes (Hardened Plan)

The following hardened implementation plan incorporates feedback from Domain-Driven Design (DDD) and Clean Code reviews. It resolves race conditions, multi-tenant state leakage, unencapsulated storage logic, and adds automated unit test requirements.

## Feature Description

Enhances the student assessment experience by:
1. Guaranteeing the dashboard/assessment cards dynamically update when returning from a partially completed assessment without relying on magic timers.
2. Automatically skipping the intro disclaimer if a draft exists.
3. Automatically scrolling/jumping to the exact question position the user was last viewing using a dedicated, user-scoped position hook with defensive bounds clamping.

## User Story

As a student
I want the system to remember my exact place in the test and update my progress card instantly when I close it
So that my experience is seamless and I don't have to navigate through disclaimers or refresh the page

## Problem Statement

Currently, when a student closes an unfinished test, the `/api/assessments` react-query cache goes stale. Additionally, opening a partially finished test forces the student to read the intro disclaimer again and manually navigate back to the question they were last working on. The naive approach of using `setTimeout` for query invalidation and un-scoped `localStorage` keys introduces race conditions and multi-user data leakage.

## Solution Statement

1. Extract a custom hook `useAssessmentPosition.ts` to manage position persistence, user-scoped keys (`assessment_progress_${userId}_${assessmentId}`), safe JSON parsing, and defensive index bounds clamping.
2. Invalidate React Query cache synchronously on exit or within progress mutation callbacks, eliminating non-deterministic `setTimeout` hacks.
3. Automatically skip the intro disclaimer in `AssessmentFlow.tsx` when `savedAnswers` exists.
4. Add automated unit tests to verify position restoration, error recovery, and storage cleanup.

## Feature Metadata

**Feature Type**: Enhancement / Bug Fix
**Estimated Complexity**: Low-Medium
**Primary Systems Affected**: `AssessmentFlow.tsx`, `useAssessmentPosition.ts` (New Hook), Vitest Test Suite

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `/Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentFlow.tsx` (lines 43-80) - Why: Initial data loading block.
- `/Volumes/Files/Programming/medical-system/frontend/src/hooks/useRecordProgress.ts` - Why: Existing hook managing draft persistence.

### New Files to Create

- `/Volumes/Files/Programming/medical-system/frontend/src/hooks/useAssessmentPosition.ts` - Custom hook encapsulating position persistence, safe parsing, bounds clamping, and cleanup.
- `/Volumes/Files/Programming/medical-system/frontend/src/hooks/__tests__/useAssessmentPosition.test.ts` - Automated unit tests for position management.

---

## IMPLEMENTATION PLAN

### Phase 1: Encapsulated Position Hook (`useAssessmentPosition.ts`)
**Tasks:**
- Create `useAssessmentPosition.ts` to accept `userId`, `assessmentId`, and `sections`.
- Provide safe `savePosition(sectionIdx, questionIdx)`, `getPosition()`, and `clearPosition()` functions.
- Enforce user-scoping on keys: `assessment_progress_${userId}_${assessmentId}`.
- Implement defensive bounds clamping: `Math.min(Math.max(0, storedIdx), maxLen - 1)`.
- Write unit tests in `useAssessmentPosition.test.ts`.

### Phase 2: Refactor `AssessmentFlow.tsx` & Skip Intro
**Tasks:**
- Integrate `useAssessmentPosition` inside `AssessmentFlow.tsx`.
- In the initial fetch callback, if `savedAnswers` has keys, skip intro (`setAppState('assessment')`) and restore position via the new hook.
- Synchronize question index updates with `savePosition`.

### Phase 3: Synchronous Cache Invalidation & Cleanup
**Tasks:**
- Invalidate `['/api/assessments']` synchronously upon modal exit.
- Clear stored position on test completion or reset.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### CREATE `frontend/src/hooks/useAssessmentPosition.ts`
- **IMPLEMENT**: Custom hook returning `{ getPosition, savePosition, clearPosition }`.
- **PATTERN**: Use `session.user?.id || session.token` to construct storage key `assessment_progress_${userId}_${assessmentId}`.
- **BOUNDS CLAMPING**:
  ```typescript
  const safeSectionIdx = Math.min(Math.max(0, parsed.sectionIdx || 0), sections.length - 1);
  const safeQuestionIdx = Math.min(Math.max(0, parsed.questionIdx || 0), (sections[safeSectionIdx]?.questions.length || 1) - 1);
  ```
- **VALIDATE**: `cd frontend && npm run test`

### CREATE `frontend/src/hooks/__tests__/useAssessmentPosition.test.ts`
- **IMPLEMENT**: Unit tests covering:
  1. Key generation with user ID scoping.
  2. Safe JSON parsing with fallback to (0, 0) on syntax errors.
  3. Defensive clamping when stored indices exceed section/question lengths.
  4. Cleanup on `clearPosition()`.
- **VALIDATE**: `cd frontend && npx vitest run src/hooks/__tests__/useAssessmentPosition.test.ts`

### UPDATE `frontend/src/components/assessments/AssessmentFlow.tsx`
- **IMPLEMENT (Hook Integration)**: Import and instantiate `useAssessmentPosition(session?.user?.id || 'guest', assessmentId, activeSections)`.
- **IMPLEMENT (Load & Skip Intro)**: In initial fetch success block, if `data.savedAnswers` has keys:
  - `setAppState('assessment');`
  - Get safe position from hook and update state: `const pos = getPosition(); setCurrentSectionIdx(pos.sectionIdx); setCurrentQuestionIdx(pos.questionIdx);`.
- **IMPLEMENT (Position Persistence)**: Add `useEffect` triggering on `currentSectionIdx` and `currentQuestionIdx` to invoke `savePosition`.
- **IMPLEMENT (Clean Invalidation)**: In `handleCloseAttempt` and the "Save and exit" dialog button, trigger `queryClient.invalidateQueries({ queryKey: ['/api/assessments'] })` synchronously when exiting.
- **IMPLEMENT (Cleanup)**: Call `clearPosition()` in `submitAssessment` success callback and in the "Restart" button click handler.
- **VALIDATE**: `cd frontend && npm run lint && npm run test`

---

## TESTING STRATEGY

### Unit Tests
Automated tests in `useAssessmentPosition.test.ts` to verify key isolation, JSON error recovery, and index bounds clamping.

### Integration / Manual Tests
1. Open a test as Student A, navigate to Q2, close modal. Verify dashboard progress updates.
2. Re-open test. Verify intro is skipped and user lands on Q2.
3. Log out and log in as Student B. Verify Student B does NOT inherit Student A's position.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
`cd /Volumes/Files/Programming/medical-system/frontend && npm run lint`

### Level 2: Unit Tests
`cd /Volumes/Files/Programming/medical-system/frontend && npm run test`
