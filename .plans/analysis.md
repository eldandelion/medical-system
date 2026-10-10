# Root Cause Analysis: Assessment History Tab Row Highlighting Bug

## Root Cause
In `DispatchHistoryTab.tsx`, the `DataTable` component uses `getRowId={(row) => String(row.studentId || row.studentNumber)}` and compares it to `selectedId={selectedStudentId}` to determine which rows are highlighted. Since a single student can have multiple participation records (e.g. they were assigned multiple assessments over time), all records belonging to the clicked student evaluate to the same row ID. Consequently, when a user clicks any record, `selectedStudentId` is set in the parent `AdminPage`, causing every row associated with that student to highlight simultaneously instead of just the clicked row.

## Proposed Fix Strategy
1. **Uniquely Identify Rows:** Update `DispatchHistoryTab.tsx` so that `DataTable` uses a unique identifier for each row, specifically `getRowId={(row) => String(row.assignmentId)}` (or fallback to `row.id` if available).
2. **Track Selected Record:** Introduce a `selectedRecordId` state in `AssessmentCatalogManagementView`. 
3. **Update Callback Signatures:** Modify `DispatchHistoryTabProps.onSelect` to pass back the clicked `record` (`ParticipationRecordDto`) alongside the `student` object.
4. **Synchronize Highlight with Panel:** When a row is clicked, `AssessmentCatalogManagementView` will set `selectedRecordId` to the record's `assignmentId` and pass it to `DispatchHistoryTab` as `selectedId`. To ensure the highlight clears when the user closes the side panel, add a `useEffect` in `AssessmentCatalogManagementView` that listens to the `selectedStudentId` prop from `AdminPage`; if `selectedStudentId` is falsy, reset `selectedRecordId` to `null`.

## Affected Components
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`: 
  - Update `DispatchHistoryTabProps` to include `selectedRecordId` and change `onSelect` signature to include the record.
  - Update `DataTable` props: `selectedId={selectedRecordId}` and `getRowId={(row) => String(row.assignmentId)}`.
- `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`: 
  - Add `selectedRecordId` state and effect to clear it when `selectedStudentId` is unset.
  - Pass the new props and update the `onSelect` handler for `DispatchHistoryTab`.
