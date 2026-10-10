# Root Cause Analysis: Assessment History UI Bugs

## 1. Data Table Entries Background and Styling
- **Issue**: The assessment history data table (`DispatchHistoryTab.tsx`) doesn't match the "全局转诊管理" table style.
- **Root Cause**: `ReferralManagementView` uses a custom `render` function in its columns to display an `AvatarBadge` with the student name and ID stacked in a flex column layout. `DispatchHistoryTab` renders raw text across separate columns.
- **Fix Strategy**: Update the `columns` definition in `DispatchHistoryTab` to combine the student name and number into a single column utilizing the `AvatarBadge`, exactly matching the style in `ReferralManagementView`.

## 2. Missing Columns: Assessment Name and Dispatch Time
- **Issue**: The entries lack "assessment name" and "dispatch time" columns.
- **Root Cause**: The backend DTO `ParticipationRecordDto` and its corresponding frontend TypeScript interface do not include these fields.
- **Fix Strategy**: 
  1. Update `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDispatchHistoryDtos.kt` to include `assessmentName` (String) and `dispatchedAt` (LocalDateTime/String depending on format) in `ParticipationRecordDto`.
  2. Update the corresponding backend service/mapper to populate these fields.
  3. Update `frontend/src/types/index.ts` to include these fields in `ParticipationRecordDto`.
  4. Update `DispatchHistoryTab` columns to display them.

## 3. Status Translation
- **Issue**: The status is rendered in English (e.g., PENDING, COMPLETED) instead of Chinese.
- **Root Cause**: The raw enum string is directly rendered.
- **Fix Strategy**: Implement a mapping function or use a `StatusBadge` in `DispatchHistoryTab.tsx` to map enum values to Chinese translations (e.g., PENDING -> '待完成', COMPLETED -> '已完成').

## 4. Details View Rendering Inside Canvas
- **Issue**: Clicking a row opens the details panel inside the main canvas rather than alongside it.
- **Root Cause**: `DispatchHistoryTab` manages local state for `selectedStudent` and renders the `<DetailsPanel>` inline at the bottom of its own JSX flex container, constraining it within the canvas.
- **Fix Strategy**: Hoist the selected row state up to the parent layout. The tab should accept an `onSelect` callback prop. The parent container (`AssessmentCatalogManagementView` or similar parent that is wrapped by `<MainContent>`) will hold the state and pass the `<DetailsPanel>` into the `sidePanel` prop of `<MainContent>`, mimicking the architecture of `ReferralManagementView.tsx` and `AdminPage.tsx`.
