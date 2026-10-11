# Implementation Plan: Assessment Names, Status Color Alignment & Recall Icon Button

## Overview
1. Resolve raw assessment codes/enums into actual localized assessment names (e.g. `情绪状况评估 (PHQ-9)`) in the "量表名称" column of `DispatchHistoryTab.tsx`.
2. Align status dot colors in `AssessmentHistoryTab.tsx` with `DispatchHistoryTab.tsx` (`COMPLETED` -> green, `PENDING`/`IN_PROGRESS` -> orange, `EXPIRED` -> red, `REVOKED` -> gray).
3. Replace the text "撤销" button in `AssessmentHistoryTab.tsx` with an accessible `undo` backward-arrow icon button.

---

## File-by-File Roadmap

### 1. `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`
- Add tests verifying `getAssessmentName` resolves `batteryCode` / enum values into localized assessment titles in the table.
- Verify fallback behavior when assessment name is undefined or unrecognized.

### 2. `frontend/src/components/students/AssessmentHistoryTab.test.tsx`
- Update tests verifying status dot colors:
  - `COMPLETED`: `bg-green-500`
  - `PENDING`: `bg-orange-500`
- Update tests asserting the revoke button renders the `undo` Material Symbol icon button with accessible `aria-label="撤销"` / `title="撤销"`.

### 3. `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- Import `getAssessmentName` from `../../constants/assessmentDictionary`.
- Import `useAssessmentCatalogManagement` from `../../hooks/useAssessmentCatalogManagement`.
- Use catalog titles to resolve `getAssessmentName(item.assessmentName, catalogTitle)`.

### 4. `frontend/src/components/students/AssessmentHistoryTab.tsx`
- Update `getStatusDisplay`:
  - `COMPLETED` -> `bg-green-500`
  - `PENDING` -> `bg-orange-500`
  - `IN_PROGRESS` -> `bg-orange-500`
  - `EXPIRED` -> `bg-red-500`
  - `REVOKED` -> `bg-gray-400`
- Replace text button with `undo` icon button with `title="撤销"`, `aria-label="撤销"`.

---

## Writable Files
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`
- `frontend/src/components/students/AssessmentHistoryTab.tsx`
- `frontend/src/components/students/AssessmentHistoryTab.test.tsx`
- `.plans/task.md`
