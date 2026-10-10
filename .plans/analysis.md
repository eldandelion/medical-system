# Assessment History Tab UI Bugs Analysis

## Bug 1: All entries show as selected by default
**Root Cause:**  
In `DataTable.tsx`, the selection check is implemented as `const isSelected = selectedId === item.id;`. When a user navigates to the tab without selecting a record, the passed `selectedStudentId` is `undefined`. Since the API or mock data might not populate the `id` field on `ParticipationRecordDto` (leaving it as `undefined`), the strict equality check evaluates to `undefined === undefined`, making it `true` for all rows.
**Proposed Fix Strategy:**  
Update `DataTable.tsx` to require a defined `selectedId` before applying the match. For example: `const isSelected = selectedId != null && selectedId === rowId;`.
**Affected Components:**  
- `frontend/src/components/common/DataTable.tsx`

## Bug 2: Clicked entry is not visually selected
**Root Cause:**  
In `DispatchHistoryTab.tsx`, the `selectedStudentId` is passed as the `selectedId` prop to `DataTable`. However, `DataTable` blindly compares it to `item.id`, which corresponds to the `ParticipationRecordDto`'s ID (the record's primary key), not the student's ID. Because these identifiers represent different domains (student ID vs record ID), the check fails and no row is highlighted.
**Proposed Fix Strategy:**  
Add an optional `getRowId?: (item: T) => string | number` prop to `DataTableProps` (defaulting to returning `item.id`). Then, in `DispatchHistoryTab.tsx`, provide `getRowId={(row) => String(row.studentId || row.studentNumber)}` so that the table compares the `selectedStudentId` with the actual student identifier.
**Affected Components:**  
- `frontend/src/components/common/DataTable.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`

## Bug 3: '预警等级' (Severity) column needs to be removed
**Root Cause:**  
The severity column is explicitly hardcoded in the `columns` configuration array inside `DispatchHistoryTab.tsx`.
**Proposed Fix Strategy:**  
Remove the object with `key: 'severity'` from the `columns` array in `DispatchHistoryTab.tsx`.
**Affected Components:**  
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`
