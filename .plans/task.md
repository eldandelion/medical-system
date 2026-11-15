# Implementation Plan: Assessment Scale DetailsPanel Rework

## Overview
Rework the `测评量表` (`Assessments`) catalog view across `AdminPage`, `HeadCouncillorPage`, and `TeacherPage` so selecting an assessment scale opens the right-hand `DetailsPanel` inside `MainContent` instead of the obsolete `AssessmentScaleDetailsFullScreen` modal. The panel features two rich tabs (`概览` and `量表题目`), live availability synchronization with the React Query cache, footer and row lifecycle actions (`指派测评`, `隐藏量表`, `启用上线`), and seamless full-screen expansion via `DetailsPanel`.

---

## 1. Explicit Writable Files List

During Phase 4 (TDD Execution), **ONLY** the following files may be created, modified, or deleted:

### Files to Create (13 files)
1. `frontend/src/hooks/useScaleLifecycleActions.ts`
2. `frontend/src/hooks/useScaleLifecycleActions.test.ts`
3. `frontend/src/components/assessments/HideScaleConfirmationDialog.tsx`
4. `frontend/src/components/assessments/HideScaleConfirmationDialog.test.tsx`
5. `frontend/src/components/assessments/AssessmentScaleOverviewTab.tsx`
6. `frontend/src/components/assessments/AssessmentScaleOverviewTab.test.tsx`
7. `frontend/src/components/assessments/AssessmentScaleQuestionsTab.tsx`
8. `frontend/src/components/assessments/AssessmentScaleQuestionsTab.test.tsx`
9. `frontend/src/components/assessments/AssessmentScaleDetailsView.tsx`
10. `frontend/src/components/assessments/AssessmentScaleDetailsView.test.tsx`
11. `frontend/src/components/assessments/assessmentPanelConfig.tsx`
12. `frontend/src/components/assessments/assessmentPanelConfig.test.tsx`
13. `frontend/src/pages/AssessmentDetailsIntegration.test.tsx`

### Files to Modify (5 files)
1. `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
2. `frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx`
3. `frontend/src/pages/AdminPage.tsx`
4. `frontend/src/pages/HeadCouncillorPage.tsx`
5. `frontend/src/pages/TeacherPage.tsx`

### Files to Delete (2 files)
1. `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.tsx`
2. `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.test.tsx`

---

## 2. File-by-File Roadmap

### 2.1 `frontend/src/hooks/useScaleLifecycleActions.ts`
- **Responsibility**: Shared hook encapsulating scale lifecycle actions (`handleOpenAssign`, `requestToggleAvailability`, `confirmHideScale`, `cancelHideScale`).
- **Exported Symbols**: `useScaleLifecycleActions(options?: { onScaleAssigned?: () => void })`
- **Return Type**:
  ```ts
  export interface ScaleLifecycleActions {
    handleOpenAssign: (scale: AssessmentCatalogItemDto) => void;
    requestToggleAvailability: (scale: AssessmentCatalogItemDto, explicitState?: boolean) => Promise<void> | void;
    pendingHideScale: AssessmentCatalogItemDto | null;
    confirmHideScale: () => Promise<void>;
    cancelHideScale: () => void;
    isToggling: boolean;
    togglingCode: string | null;
  }
  ```
- **Dependencies**: `useAssessmentCatalogManagement`, `useCreationOverlay`, `AssessmentAssignmentCreationForm`.

### 2.2 `frontend/src/components/assessments/HideScaleConfirmationDialog.tsx`
- **Responsibility**: Extracted confirmation modal (`确认隐藏测评量表？`) with collapsible compliance consequences (`查看操作影响与合规说明`).
- **Exported Symbols**: `HideScaleConfirmationDialog`
- **Props**:
  ```ts
  export interface HideScaleConfirmationDialogProps {
    scale: AssessmentCatalogItemDto | null;
    isOpen: boolean;
    onConfirm: () => Promise<void> | void;
    onCancel: () => void;
    isSubmitting?: boolean;
  }
  ```
- **UI Elements**: `GenericDialog`, `TertiaryButton`, `AnimatePresence`, `motion.div`. Compliance cards: `目录隐藏与分发暂停`, `在途问卷有效完成`, `历史档案完整保留`, `随时恢复上线`.

### 2.3 `frontend/src/components/assessments/AssessmentScaleOverviewTab.tsx`
- **Responsibility**: Overview tab content presenting scale metadata, availability badge, description card, and section summary.
- **Exported Symbols**: `AssessmentScaleOverviewTab`
- **Props**:
  ```ts
  export interface AssessmentScaleOverviewTabProps {
    scale: AssessmentCatalogItemDto;
  }
  ```
- **Key Sections**:
  - `基本属性`: `GroupedInfoList` displaying `量表代码` (`batteryCode`), `量表类别` (`subtitle`), `题目总数` (`questionCount 题`), `预估用时` (`duration`), `分部数量` (`sections.length 部`), and `状态` (`正常可用` / `已隐藏`).
  - `量表说明`: Card displaying `scale.description` (fallback: `暂无详细量表描述`).
  - `分部概览`: List summarizing each section's title, subtitle, and question count.

### 2.4 `frontend/src/components/assessments/AssessmentScaleQuestionsTab.tsx`
- **Responsibility**: Collapsible question listing optimized for large batteries (e.g. 377+ questions).
- **Exported Symbols**: `AssessmentScaleQuestionsTab`, `QuestionPreviewCard` (memoized)
- **Props**:
  ```ts
  export interface AssessmentScaleQuestionsTabProps {
    scale: AssessmentCatalogItemDto;
  }
  ```
- **Key Behavior**:
  - `expandedSectionIds`: Set initialized to first section ID (`sections[0]?.id`). Resets on `scale.batteryCode` change.
  - Collapsed sections do not render question nodes (`{isExpanded && (...)}`), ensuring snappy rendering on large scales.
  - Controls header: Total question count badge, `全部展开` / `全部收起` toggles.
  - Question card: Question number, question text, type badge (`单选`, `多选`, `滑块`, `填空`, `数值`, `日期`), options preview with option scores/labels, range min/max/unit, textInput placeholder.

### 2.5 `frontend/src/components/assessments/AssessmentScaleDetailsView.tsx`
- **Responsibility**: Primary scale details component mounted inside `DetailsPanel`.
- **Exported Symbols**: `AssessmentScaleDetailsView`, `ScaleDetailsTabs`, `SCALE_DETAILS_TABS`
- **Props**:
  ```ts
  export interface AssessmentScaleDetailsViewProps {
    scale: AssessmentCatalogItemDto;
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    defaultTab?: string;
    footer?: React.ReactNode;
  }
  ```
- **Key Invariants**:
  - Live query cache subscription: derives current scale from `useAssessmentCatalogManagement().catalog.find(s => s.batteryCode === scale.batteryCode) ?? scale`.
  - `useDetails()` integration: dynamically sets header override (avatar icon via `getAssessmentIcon`, title, subtitle, availability badge) and restores on unmount.
  - If `!isFullScreen`, renders local `SecondaryTabs`. If `isFullScreen`, hides local tabs because `FullScreenView` renders tabs in its sidebar.
  - Default `ActionFooter`: `指派测评` (disabled when scale hidden), `隐藏量表` / `启用上线` (toggles dialog or calls toggle). Renders `HideScaleConfirmationDialog`.

### 2.6 `frontend/src/components/assessments/assessmentPanelConfig.tsx`
- **Responsibility**: Centralized helpers and type-guards shared by `AdminPage`, `HeadCouncillorPage`, and `TeacherPage`.
- **Exported Symbols**:
  - `isAssessmentScale(item: unknown): item is AssessmentCatalogItemDto`
  - `getAssessmentDetailsPanelProps(selectedItem, activeTab, onTabChange)`
  - `renderAssessmentDetailsPanelContent(selectedItem, activeTab, onTabChange)`

### 2.7 `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
- **Changes**:
  - Add props `onScaleSelect?: (scale: AssessmentCatalogItemDto | null) => void` and `selectedScaleCode?: string`.
  - Clicking a row in `量表列表` triggers `onScaleSelect?.(item)` instead of local `AssessmentScaleDetailsFullScreen`.
  - Highlight active table row matching `selectedScaleCode`.
  - Sub-tab switching between `量表列表` and `指派历史` clears selection via `onScaleSelect?.(null)` and `onStudentSelect?.(null as any)`.
  - Refactor row actions to reuse `useScaleLifecycleActions` and `HideScaleConfirmationDialog`.
  - Delete `AssessmentScaleDetailsFullScreen` import and usage.

### 2.8 `frontend/src/pages/AdminPage.tsx`, `HeadCouncillorPage.tsx`, `TeacherPage.tsx`
- **Changes**:
  - Wire `onScaleSelect` and `selectedScaleCode` to `AssessmentCatalogManagementView`.
  - In `sidePanel` (`DetailsPanel`):
    - When on `ASSESSMENTS` tab, check `isAssessmentScale(selectedItem)`:
      - If scale: title/subtitle/avatar/badge from scale metadata, tabs = `SCALE_DETAILS_TABS`, children = `<AssessmentScaleDetailsView scale={selectedItem} activeTab={activeTab} onTabChange={setActiveTab} />`.
      - If student: student metadata, tabs = `STUDENT_DETAILS_TABS`, children = `<StudentDetailsView ... />`.
  - In `getTabsForPage()`:
    - If `activePage === ASSESSMENTS`: return `isAssessmentScale(selectedItem) ? SCALE_DETAILS_TABS : STUDENT_DETAILS_TABS`.

---

## 3. TDD Task Order (Red -> Green -> Refactor)

### Unit 1: `useScaleLifecycleActions` & `HideScaleConfirmationDialog`
1. **Red**: Write unit test `frontend/src/hooks/useScaleLifecycleActions.test.ts`:
   - Test `handleOpenAssign` triggers `openCreation` with `'指派心理测评'` and `AssessmentAssignmentCreationForm`.
   - Test `requestToggleAvailability` with `isEnabled: true` scale sets `pendingHideScale`.
   - Test `requestToggleAvailability` with `isEnabled: false` scale directly invokes `toggleAvailability` with `isAvailable: true`.
   - Test `confirmHideScale` invokes `toggleAvailability` with `isAvailable: false` and clears `pendingHideScale`.
   - Test `cancelHideScale` clears `pendingHideScale` without toggling.
2. **Green**: Implement `frontend/src/hooks/useScaleLifecycleActions.ts`. Run Vitest to verify tests pass.
3. **Red**: Write unit test `frontend/src/components/assessments/HideScaleConfirmationDialog.test.tsx`:
   - Test modal renders title `确认隐藏测评量表？`, scale title, battery code, question count, duration.
   - Test clicking `查看操作影响与合规说明` expands consequence cards (`目录隐藏与分发暂停`, etc.).
   - Test clicking `取消` fires `onCancel`.
   - Test clicking `确认隐藏` fires `onConfirm`.
   - Test buttons disabled when `isSubmitting` is true.
4. **Green**: Implement `frontend/src/components/assessments/HideScaleConfirmationDialog.tsx`. Run Vitest to verify tests pass.

### Unit 2: Scale Detail Tabs & `AssessmentScaleDetailsView`
1. **Red**: Write unit test `frontend/src/components/assessments/AssessmentScaleOverviewTab.test.tsx`:
   - Test rendering metadata attributes (`batteryCode`, `subtitle`, `questionCount`, `duration`, `sections.length`).
   - Test status pill rendering (`正常可用` vs `已隐藏`).
   - Test description rendering and empty fallback.
   - Test section summary list.
2. **Green**: Implement `frontend/src/components/assessments/AssessmentScaleOverviewTab.tsx`. Run Vitest to verify.
3. **Red**: Write unit test `frontend/src/components/assessments/AssessmentScaleQuestionsTab.test.tsx`:
   - Test first section is expanded by default and second section is collapsed.
   - Test clicking section header toggles expansion.
   - Test `全部展开` expands all sections; `全部收起` collapses all sections.
   - Test question preview rendering: question number, question text, type badge, options list with scores, slider/number ranges and units, placeholder text.
   - Test defensive fallback when `sections` or `options` are undefined or empty.
4. **Green**: Implement `frontend/src/components/assessments/AssessmentScaleQuestionsTab.tsx`. Run Vitest to verify.
5. **Red**: Write unit test `frontend/src/components/assessments/AssessmentScaleDetailsView.test.tsx`:
   - Test renders overview tab by default and switches to questions tab on tab change.
   - Test `useDetails()` header override synchronization on mount and cleanup on unmount.
   - Test hides local `SecondaryTabs` when `isFullScreen` is true in `DetailsContext`.
   - Test live cache synchronization: updates availability status pill immediately when catalog query data updates.
   - Test ActionFooter buttons:
     - `指派测评` is enabled when scale is available, disabled when scale is hidden.
     - Available scale displays `隐藏量表` button; clicking opens `HideScaleConfirmationDialog`.
     - Hidden scale displays `启用上线` button; clicking directly toggles availability.
6. **Green**: Implement `frontend/src/components/assessments/AssessmentScaleDetailsView.tsx`. Run Vitest to verify.

### Unit 3: `assessmentPanelConfig.tsx` & `AssessmentCatalogManagementView.tsx`
1. **Red**: Write unit test `frontend/src/components/assessments/assessmentPanelConfig.test.tsx`:
   - Test `isAssessmentScale` returns true for catalog item DTO and false for student or other objects.
   - Test `getAssessmentDetailsPanelProps` returns scale tabs and metadata when scale is selected, and student tabs and metadata when student is selected.
   - Test `renderAssessmentDetailsPanelContent` renders `AssessmentScaleDetailsView` vs `StudentDetailsView`.
2. **Green**: Implement `frontend/src/components/assessments/assessmentPanelConfig.tsx`. Run Vitest to verify.
3. **Red**: Update `frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx`:
   - Test clicking a scale table row invokes `onScaleSelect(scale)` with the selected scale item.
   - Test row click does NOT render obsolete full-screen elements (`量表题目明细与临床常模配置`, `完成`).
   - Test sub-tab change to `指派历史` invokes `onScaleSelect(null)` and `onStudentSelect(null)`.
   - Test inline row actions: `指派测评` opens creation overlay; `隐藏量表` triggers confirmation dialog; `启用上线` directly toggles availability.
4. **Green**: Modify `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`:
   - Add `onScaleSelect` and `selectedScaleCode` props.
   - Connect row click to `onScaleSelect`.
   - Clear selections on sub-tab change.
   - Remove `AssessmentScaleDetailsFullScreen` import and state.
   - Verify all tests in `AssessmentCatalogManagementView.test.tsx` pass.

### Unit 4: Role Pages Integration (`AdminPage`, `HeadCouncillorPage`, `TeacherPage`)
1. **Red**: Write integration test `frontend/src/pages/AssessmentDetailsIntegration.test.tsx`:
   - For `AdminPage`: switching to `测评量表` and clicking a scale row opens `DetailsPanel` rendering `AssessmentScaleDetailsView` with `概览` tab and action footer (`指派测评`, `隐藏量表`).
   - For `HeadCouncillorPage`: clicking a scale row in `测评量表` opens `DetailsPanel` with `AssessmentScaleDetailsView`.
   - For `TeacherPage`: clicking a scale row in `测评量表` opens `DetailsPanel` with `AssessmentScaleDetailsView`.
   - In `AdminPage` under `测评量表` -> `指派历史`: clicking a student record still opens `StudentDetailsView` cleanly with student tabs.
2. **Green**: Update `frontend/src/pages/AdminPage.tsx`, `frontend/src/pages/HeadCouncillorPage.tsx`, and `frontend/src/pages/TeacherPage.tsx`:
   - Wire `onScaleSelect` and `selectedScaleCode` on `AssessmentCatalogManagementView`.
   - Adapt `DetailsPanel` title, subtitle, icon, avatar, tabs, and children via `isAssessmentScale` and `assessmentPanelConfig`.
   - Run integration tests to verify all 3 role pages pass green.

### Unit 5: Obsolete File Deletion & Clean-up
1. Verify no remaining imports of `AssessmentScaleDetailsFullScreen` exist anywhere in `frontend/src/`.
2. Delete `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.tsx`.
3. Delete `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.test.tsx`.
4. Run full frontend test suite and linter to confirm clean deletion with zero orphaned references.

---

## 4. Verification Commands

Run the following commands inside `frontend/`:

```bash
# 1. Run all unit and integration tests
npm test

# 2. Run TypeScript strict type-checking and linter
npm run lint

# 3. Verify production build succeeds
npm run build
```

---

## Success Criteria Checklist
- [ ] Clicking any scale row in `量表列表` opens `DetailsPanel` in `AdminPage`, `HeadCouncillorPage`, and `TeacherPage`.
- [ ] Panel displays `概览` tab with full metadata, availability pill, description, and section breakdown.
- [ ] Panel displays `量表题目` tab with collapsible section cards, default first-section expansion, expand-all / collapse-all, and question preview.
- [ ] Table row quick-actions (`指派测评`, `隐藏量表`, `启用上线`) and `DetailsPanel` footer actions function consistently.
- [ ] Toggling availability immediately syncs both the catalog query cache and open `DetailsPanel` state.
- [ ] Fullscreen toggle (`open_in_full`) expands `DetailsPanel` into `FullScreenView`, moving tabs to sidebar and portaling footer actions.
- [ ] `指派历史` row click continues opening `StudentDetailsView` as before.
- [ ] Switching between `量表列表` and `指派历史` clears the active side panel selection.
- [ ] `AssessmentScaleDetailsFullScreen` and its test file are completely deleted with zero compiler warnings or broken imports.
- [ ] `npm test`, `npm run lint`, and `npm run build` all pass with zero errors.
