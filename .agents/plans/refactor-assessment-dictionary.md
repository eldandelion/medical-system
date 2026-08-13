# Feature: Refactor Assessment UI to use Shared Dictionary

## Feature Description

Refactor the `AssessmentHistoryTab` and `AssignQuestionnaireDialog` components to use a newly created central static dictionary (`src/constants/assessmentDictionary.ts`). This dictionary acts as a fallback for missing or legacy `batteryCode` enums (like `MENTAL_HEALTH_ASSESSMENT`) ensuring that all components consistently display correct localized text even if the backend catalog does not contain the legacy keys.

## User Story

As a teacher or student
I want to see consistent, localized names for assessments across all tables and dialogs
So that I am not confused by raw technical enums like `MENTAL_HEALTH_ASSESSMENT` appearing in the UI.

## Problem Statement

Currently, when the backend returns a legacy assignment record (e.g., `MENTAL_HEALTH_ASSESSMENT`), the frontend fails to find a matching entry in the `/api/assessments/catalog`. This causes the raw string to be rendered in the UI, and causes the dialog filter to completely drop the assigned assessment from the visible list. Previous attempts to fix this resulted in duplicated fallback logic that was inconsistent between components.

## Solution Statement

Centralize the fallback mapping into a `src/constants/assessmentDictionary.ts` file. Both `AssessmentHistoryTab` and `AssignQuestionnaireDialog` will import a shared helper function `getAssessmentName` from this dictionary. This ensures exactly one source of truth for presentation strings on the frontend, respecting the strict "No Presentation Strings in Backend" architectural rule.

## Feature Metadata

**Feature Type**: Refactor
**Estimated Complexity**: Low
**Primary Systems Affected**: Frontend Student UI (`AssessmentHistoryTab`, `AssignQuestionnaireDialog`)
**Dependencies**: None

---

## CONTEXT REFERENCES

### Relevant Codebase Files
- `frontend/src/constants/assessmentDictionary.ts` (Already created) - Why: Contains the unified mapping and `getAssessmentName` helper function.
- `frontend/src/components/students/AssessmentHistoryTab.tsx` - Why: Needs to replace its internal `getAssessmentName` fallback logic with the shared dictionary import.
- `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx` - Why: Needs to replace its internal fallback in the `assignedAssessments` map with the shared dictionary.

### Patterns to Follow
**Localization Fallback Pattern:** Always attempt to use the `catalog.title` first. If unavailable, use the static dictionary lookup. If still unavailable, fallback to the raw enum string as a last resort.

---

## IMPLEMENTATION PLAN

### Phase 1: AssessmentHistoryTab Refactor
- Import `getAssessmentName` from `../../constants/assessmentDictionary`.
- Remove the local hardcoded fallback logic inside `AssessmentHistoryTab`.
- Update the column definition to call the shared helper.

### Phase 2: AssignQuestionnaireDialog Refactor
- Import `getAssessmentName` from `../../constants/assessmentDictionary`.
- Update the `assignedAssessments` mapping to dynamically fetch the title using `getAssessmentName(id)` rather than hardcoding `id === 'MENTAL_HEALTH_ASSESSMENT'`.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### UPDATE frontend/src/components/students/AssessmentHistoryTab.tsx
- **IMPLEMENT**: Replace the internal `getAssessmentName` fallback with the external `getAssessmentName` imported from `src/constants/assessmentDictionary.ts`.
- **IMPORTS**: `import { getAssessmentName } from '../../constants/assessmentDictionary';`
- **VALIDATE**: `npm run lint` inside the `frontend` directory.

### UPDATE frontend/src/components/assessments/AssignQuestionnaireDialog.tsx
- **IMPLEMENT**: Replace the hardcoded `MENTAL_HEALTH_ASSESSMENT` check in the `assignedAssessments` map loop with `getAssessmentName(id, found?.title)`.
- **IMPORTS**: `import { getAssessmentName } from '../../constants/assessmentDictionary';`
- **VALIDATE**: `npm run lint` inside the `frontend` directory.

---

## TESTING STRATEGY

### Unit Tests
Verify that typescript strictly checks the newly imported module paths and ensures the function signatures match.

### Integration Tests
Ensure that the MSW handlers don't crash when rendering these components during tests.

### Edge Cases
- Legacy string `MENTAL_HEALTH_ASSESSMENT` must explicitly render as `年度身心健康状况综合评估`.
- Unknown strings (e.g. `UNKNOWN_ABC`) should fall back to rendering exactly as `UNKNOWN_ABC`.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
cd frontend && npm run lint
```

### Level 2: Unit Tests
```bash
cd frontend && npm run test -- --run
```

---

## ACCEPTANCE CRITERIA

- [ ] `AssessmentHistoryTab` no longer contains a local hardcoded check for `MENTAL_HEALTH_ASSESSMENT`.
- [ ] `AssignQuestionnaireDialog` uses the shared dictionary for fallbacks.
- [ ] Linting passes completely.
- [ ] Tests pass completely.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] All validation commands executed successfully
- [ ] Full test suite passes (unit + integration)
- [ ] No linting or type checking errors

---

## NOTES
This refactor cleanly adheres to the core principle of retaining language-agnostic backends while empowering the frontend to manage localization gracefully.
