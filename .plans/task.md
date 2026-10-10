## Overview
Fixes the Assessment History Tab UI bugs where all entries show as selected by default, clicked entries are not visually selected, and an unwanted '预警等级' (Severity) column is displayed.

## Requirements
- `DataTable.tsx` must correctly apply the selected style only when `selectedId` is both defined and matches the row's identifier.
- `DataTable.tsx` should support a custom `getRowId` function to allow comparing against domain-specific identifiers (e.g., student ID vs record ID).
- `DispatchHistoryTab.tsx` must remove the '预警等级' column from the table.

## Architecture Changes
- `frontend/src/components/common/DataTable.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`

## Implementation Steps

### Phase 1: DataTable Selection Bug Fix
1. **Fix undefined selection bug** (File: frontend/src/components/common/DataTable.tsx)
   - Action: Update the `isSelected` logic to check `selectedId != null && selectedId === rowId`. 
   - Why: Prevents all rows from matching when `selectedId` and `rowId` are both undefined.
   - Dependencies: None
   - Risk: Low

2. **Add `getRowId` prop support** (File: frontend/src/components/common/DataTable.tsx)
   - Action: Add `getRowId?: (item: T) => string | number` to `DataTableProps`. Update the table row mapping to use `const rowId = getRowId ? getRowId(item) : item.id;` and use `rowId` for the `isSelected` check and optionally for `key` if needed.
   - Why: Allows parent components to specify which field to use for row identification.
   - Dependencies: Step 1
   - Risk: Low

### Phase 2: DispatchHistoryTab Fixes
3. **Use custom row identifier** (File: frontend/src/components/assessments/DispatchHistoryTab.tsx)
   - Action: Pass `getRowId={(row) => String(row.studentId || row.studentNumber)}` to the `DataTable` component.
   - Why: Ensures the selected row is highlighted correctly by comparing the actual student identifier instead of the record's primary key.
   - Dependencies: Step 2
   - Risk: Low

4. **Remove Severity Column** (File: frontend/src/components/assessments/DispatchHistoryTab.tsx)
   - Action: Remove the `{ key: 'severity', ... }` object from the `columns` array.
   - Why: UI requirement to hide this column.
   - Dependencies: None
   - Risk: Low

## Writable Files
- `frontend/src/components/common/DataTable.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- `frontend/src/components/common/DataTable.test.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`
