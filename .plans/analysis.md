# Root Cause Analysis: Assessment History Row Flickering

## Root Cause
The flickering of the selected row color is caused by a combination of state batching issues, cascading re-renders, and conflicting CSS transitions:

1. **Cascading Re-renders in `AdminPage`**: When a record is clicked, `AssessmentCatalogManagementView` calls `onStudentSelect(student)`, which triggers `setSelectedItem(student)` and `setActiveTab('details')` in `AdminPage`. However, `'details'` is not a valid tab in `STUDENT_DETAILS_TABS`. This triggers a `useEffect` in `AdminPage` that immediately resets `activeTab` to `'overview'`, causing a secondary, immediate cascading re-render.
2. **CSS Transition Conflict**: The `DataTable` rows use `transition-colors` with a conditional class switch (removing `hover:bg-surface-variant` and applying `bg-secondary-container`). The rapid successive re-renders from the `AdminPage` tab correction disrupt the browser's CSS transition engine, causing it to visibly flash or restart the animation.
3. **Effect-driven Selection Clearing**: The `useEffect` in `AssessmentCatalogManagementView` clears `selectedRecordId` if `!selectedStudentId`. If the `AdminPage` state updates result in `selectedItem` being momentarily perceived as empty or unmounted during the tab switch/details panel transition, this effect fires and explicitly sets `selectedRecordId` to `null` for a split second, unselecting the row before it recovers.

## Proposed Fix Strategy
1. **Fix AdminPage Tab Logic**: Modify `AdminPage.tsx` so that `setActiveTab('overview')` (or the first valid tab) is set directly when a student is selected, rather than setting it to `'details'` and relying on a `useEffect` to correct it. This eliminates the cascading double-render.
2. **Adjust DataTable CSS**: Remove `transition-colors` from the `DataTable` row, or apply it selectively so that the transition to the `isSelected` state is instantaneous (preventing animation from the hover background color).
3. **Refine Selection Clearing**: Update the `useEffect` in `AssessmentCatalogManagementView` to ensure `selectedRecordId` is only cleared when the user explicitly closes the details panel (e.g., when `selectedStudentId` is truly nullified by the close action), safeguarding against transient undefined states.

## Affected Components
- `frontend/src/pages/AdminPage.tsx`
- `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
- `frontend/src/components/common/DataTable.tsx`
