# Implementation Plan: Assessment History Tab UI Fixes

## Overview
Fix UI bugs in the Assessment History tab by moving row selection state up to the page level, combining Assessment and Dispatch Time into a single column, localizing status badges, and removing hardcoded background colors. Backend APIs will be updated to supply the necessary Assessment name and time.

## Requirements
- Update `ParticipationRecordDto` with `assessmentName` and `dispatchedAt`.
- Bubble row selection state from `DispatchHistoryTab` up to `AdminPage`.
- Display combined Assessment Name & Time in `DispatchHistoryTab`.
- Display localized `StatusBadge` for status and severity.
- Remove hardcoded `bg-red-100` row styles.

## Architecture Changes
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDispatchHistoryDtos.kt`: Add `assessmentName` and `dispatchedAt` to `ParticipationRecordDto`.
- `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentDispatchService.kt`: Map the new fields.
- `frontend/src/types/index.ts`: Update frontend type definitions.
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`: Refactor table columns, remove internal `DetailsPanel`, and emit `onRowClick`.
- `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`: Pass `onStudentSelect` callback.
- `frontend/src/pages/AdminPage.tsx`: Handle `onStudentSelect` and configure `sidePanel` for `AdminTabs.ASSESSMENTS`.

## Implementation Steps

### Phase 1: Backend TDD
1. **Update `ParticipationRecordDto` & Service Mapping** (Files: `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDispatchHistoryDtos.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentDispatchService.kt`)
   - **Test First**: Add test cases to `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDispatchServiceTest.kt` verifying that `getParticipationRecords` correctly populates `assessmentName` (from `assignment.batteryCode.value`) and `dispatchedAt` (from `assignment.assignedAt`).
   - Action: Add `assessmentName: String?` and `dispatchedAt: LocalDateTime?` to the DTO and update the service query mapping.
   - Why: The frontend needs this data to render the new combined column.
   - Dependencies: None
   - Risk: Low

### Phase 2: Frontend Types & Mocks TDD
2. **Update Frontend Types & MSW Mocks** (Files: `frontend/src/types/index.ts`, `frontend/src/mocks/handlers.ts`)
   - **Test First**: Update/write MSW handler integration tests asserting that the newly fetched lists include the mocked `assessmentName` and `dispatchedAt`.
   - Action: Add the fields to `ParticipationRecordDto` type and populate mock datasets.
   - Why: Prevents typing errors and provides local test data for the UI components.
   - Dependencies: Phase 1
   - Risk: Low

### Phase 3: Component UI TDD (Table Formatting)
3. **Refactor Table Columns & Status Badges** (File: `frontend/src/components/assessments/DispatchHistoryTab.tsx`)
   - **Test First**: In `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`, add tests to:
     1. Assert the presence of "量表与指派时间" header.
     2. Verify combined column data renders correctly.
     3. Verify `StatusBadge` is rendered for both "状态" and "预警等级" using expected test labels.
     4. Assert no `bg-red-100` class is applied to rows with severity.
   - Action: Implement the new combined column, import/use `StatusBadge`, and remove row background classes.
   - Why: Replaces hardcoded values and fixes styling bugs.
   - Dependencies: Phase 2
   - Risk: Low

### Phase 4: State Bubbling TDD (Component Orchestration)
4. **Extract Local State to Parent Props** (File: `frontend/src/components/assessments/DispatchHistoryTab.tsx`)
   - **Test First**: In `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`, write a test validating that clicking a row calls `onRowClick(student)` with the correct record data, and that `<DetailsPanel>` is no longer rendered locally.
   - Action: Remove `selectedStudent` local state and `<DetailsPanel>` from `DispatchHistoryTab`. Add `onRowClick` prop.
   - Why: Details panel needs to be managed at the layout level (`AdminPage`).
   - Dependencies: Phase 3
   - Risk: Medium

5. **Wire Up AssessmentCatalogManagementView** (File: `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`)
   - **Test First**: Write a shallow component test checking that `onStudentSelect` prop is properly passed down to `<DispatchHistoryTab>`.
   - Action: Add `onStudentSelect` prop and forward it.
   - Why: Prop drilling up to the page level.
   - Dependencies: Step 4
   - Risk: Low

6. **Integrate Page-Level Side Panel** (File: `frontend/src/pages/AdminPage.tsx`)
   - **Test First**: In `frontend/src/pages/AdminPage.test.tsx`, write an integration test that clicks a student in the Assessment tab and asserts that the `sidePanel` appears with `StudentDetailsView`.
   - Action: Pass `onStudentSelect` state updater down, update `getTabsForPage()`, and configure `sidePanel` for `AdminTabs.ASSESSMENTS`.
   - Why: Achieves the desired application layout behavior.
   - Dependencies: Step 5
   - Risk: Medium

## Testing Strategy
- **Backend Unit Tests**: Verify `AssessmentDispatchService` mapping logic.
- **Frontend Unit Tests**: Component-level tests for `DispatchHistoryTab` layout and interactions.
- **Integration Tests**: `AdminPage` testing for side panel state bubbling and rendering `StudentDetailsView`.

## Risks & Mitigations
- **Risk**: Backend date formats (LocalDateTime) may not map nicely to JS Date formats across different browsers.
  - **Mitigation**: Ensure ISO-8601 formatting is used in JSON responses.
- **Risk**: Bubbling state introduces prop drilling in complex trees.
  - **Mitigation**: `AdminPage` directly controls the side panel, standardizing layout state management.

## Success Criteria
- [ ] Backend DTO includes `assessmentName` and `dispatchedAt`.
- [ ] Frontend uses `StatusBadge` for status and risk levels.
- [ ] Clicking a row does not open a local overlay but bubbles up to open `StudentDetailsView` in the side panel.
- [ ] All table tests and service tests are green.
