# Implementation Plan: Assessment Records Rework (`AssessmentHistoryTab.tsx`)

## Overview
Rework the "测评记录" (Assessment Records) list in `frontend/src/components/students/AssessmentHistoryTab.tsx` by replacing the wide `<DataTable>` component (with fixed `minWidth="620px"`) with a compact, responsive Material Design 3 inset grouped capsule list (`role="list"`). This eliminates horizontal clipping inside the slide-over drawer of `StudentDetailsView.tsx` while harmonizing visually with the existing MD3 segmented capsule cards (`GroupedInfoList`).

## File-by-File Roadmap

1. **`frontend/src/components/students/AssessmentHistoryTab.test.tsx`** (New Test File)
   - Establish unit/regression tests prior to implementation (TDD).
   - Test loading and error states.
   - Test empty state rendering with rounded container (`bg-[var(--md-sys-color-surface-container-low)] rounded-[20px]`).
   - Test capsule list rendering (`role="list"` and `role="listitem"`).
   - Test adaptive corner radii using `getGroupedItemCornerRadius` for 1 item, first item, middle items, and last item in multi-item lists.
   - Test leading slot icon (`assignment` symbol).
   - Test primary title (`getAssessmentDisplayName`) and subtitle (`${assignedByName} · ${date}`).
   - Test status badge rendering (`StatusBadge` with dot color and label for each status).
   - Test revoke button visibility (rendered only for non-student roles on `PENDING` status) and trigger mutation handler.
   - Test pagination controls rendering and page change interactions when `totalPages > 1`.

2. **`frontend/src/components/students/AssessmentHistoryTab.tsx`** (Target Component)
   - Remove `<DataTable>` and its columns configuration.
   - Import `getGroupedItemCornerRadius` from `../common/GroupedInfoList`.
   - Render outer wrapper and grouped capsule list with `role="list"` and `role="listitem"`.
   - Render leading icon (`assignment`), primary title, subtitle (`${assignedByName} · ${date}`), status badge, and revoke button.
   - Update empty state styling with `rounded-[20px]`.
   - Retain pagination footer when `totalPages > 1`.

## Writable Files
- `frontend/src/components/students/AssessmentHistoryTab.tsx`
- `frontend/src/components/students/AssessmentHistoryTab.test.tsx`
- `.plans/task.md`
