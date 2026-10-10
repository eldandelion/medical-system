<Implementation Plan: Assessment History UI Bugs>
## Overview
Fix styling and functionality of the assessment history table. This includes standardizing student badge rendering, adding missing `assessmentName` and `dispatchedAt` columns across the stack, translating statuses to Chinese, and properly hoisting the details panel to the parent canvas layout.

## Requirements
- Render student name and ID in an `AvatarBadge` column exactly matching the global style.
- Display "assessment name" and "dispatch time" in the data table.
- Map backend enum statuses to Chinese.
- Details panel must render outside the main table layout, alongside it via the parent container.

## Architecture Changes
- Backend DTO and Service modified to include the new fields.
- Frontend types updated for the new fields.
- `DispatchHistoryTab` updated to match new column requirements, translate statuses, and remove inline layout.
- `AssessmentCatalogManagementView` modified to hold selected student state and pass the details panel into the side panel slot of its layout wrapper.

## Implementation Steps

### Phase 1: Backend DTO & Service Update
1. **Update DTO** (File: backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDispatchHistoryDtos.kt)
   - Action: Add `val assessmentName: String` and `val dispatchedAt: LocalDateTime` (or `String`) to `ParticipationRecordDto`.
   - Why: Needed to display the missing columns in the UI.
   - Dependencies: None
   - Risk: Low

2. **Update Service Mapper** (File: backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentDispatchService.kt)
   - Action: Populate `assessmentName` and `dispatchedAt` when creating `ParticipationRecordDto`.
   - Why: Serve the required data to frontend.
   - Dependencies: Step 1
   - Risk: Low

### Phase 2: Frontend Data & Component Fixes
3. **Update Types** (File: frontend/src/types/index.ts)
   - Action: Add `assessmentName: string` and `dispatchedAt: string` to the `ParticipationRecordDto` interface.
   - Why: Sync frontend with backend schema.
   - Dependencies: Step 1
   - Risk: Low

4. **Fix History Tab Columns** (File: frontend/src/components/assessments/DispatchHistoryTab.tsx)
   - Action: 
     - Update columns to include new fields.
     - Modify the student column to use `AvatarBadge` combining name/ID.
     - Map status enums (e.g., PENDING, COMPLETED) to Chinese labels.
     - Accept an `onSelect` prop and remove the inline `<DetailsPanel>`.
   - Why: Address UI inconsistencies, translations, and missing data.
   - Dependencies: Step 3
   - Risk: Medium

### Phase 3: Parent Layout Integration
5. **Update Parent Layout** (File: frontend/src/components/admin/AssessmentCatalogManagementView.tsx)
   - Action: Add local state for the selected row/student. Pass the `<DetailsPanel>` to the side panel prop of the main layout wrapper. Pass `onSelect` down to `DispatchHistoryTab`.
   - Why: Render the details panel correctly in the canvas.
   - Dependencies: Step 4
   - Risk: Medium

## Testing Strategy
- Unit tests: `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDispatchServiceTest.kt` (verify DTO mapping includes new fields).
- Unit tests: `frontend/src/components/assessments/DispatchHistoryTab.test.tsx` (verify AvatarBadge rendering, translations, and new columns).
- Integration tests: End-to-end table row click to verify side panel opens properly.

## Risks & Mitigations
- **Risk**: Date format mismatch between backend serialization and frontend parsing.
  - Mitigation: Use standard ISO-8601 format and frontend formatters.

## Success Criteria
- [ ] `AvatarBadge` correctly displays student name and ID stacked.
- [ ] Table includes Assessment Name and Dispatch Time columns.
- [ ] Status is translated into Chinese.
- [ ] Details panel appears in the side panel area.

## Writable Files
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDispatchHistoryDtos.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentDispatchService.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDispatchServiceTest.kt`
- `frontend/src/types/index.ts`
- `frontend/src/components/assessments/DispatchHistoryTab.tsx`
- `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
- `frontend/src/components/assessments/DispatchHistoryTab.test.tsx`
</Implementation Plan: Assessment History UI Bugs>
