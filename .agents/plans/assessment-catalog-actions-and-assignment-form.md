# Feature: Assessment Catalog Actions & Creation Overlay Assignment Form

The following plan should be complete, but it's important that you validate documentation and codebase patterns and task sanity before you start implementing.

Pay special attention to naming of existing utils, types, and models. Import from the right files etc.

---

## Feature Description

Enhance the **测评量表目录** (Assessment Catalog Management) view to transform each assessment scale card from a passive visibility-switch card into an actionable distribution center. Each card will provide:
1. A **Primary Action Button** ("指派测评" / "分发量表") that launches the standard [`CreationOverlay`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/creation-overlay/CreationSheetTemplate.tsx) drawer with a comprehensive multi-scale assignment form supporting both **Cohort (群体分发)** and **Individual Student (指定学生)** targets.
2. A **Text Button** ("查看详情") that opens a dedicated [`FullScreenView`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/FullScreenView.tsx) displaying the scale header and a clean empty/placeholder workspace for future item-level customization.
3. A **3-Dots Menu Button** (`more_horiz`) in the card's top-right corner to preserve administrative control over scale visibility (online/offline toggle) and trigger the compliance confirmation dialog.

---

## User Story

```
As a University Counselor or System Administrator
I want to assign single or multiple psychological assessment scales to an entire cohort or an individual student directly from the assessment catalog view, and inspect scale details in a full-screen view
So that I can rapidly initiate targeted psychological screenings, distribute batch evaluations across classes/majors, and audit scale configurations without leaving my workflow.
```

---

## Problem Statement

Currently, the assessment cards in `AssessmentCatalogManagementView` only have a single secondary button for toggling visibility ("隐藏量表" / "启用上线"). Staff members who want to distribute a questionnaire to students or classes must navigate away to student detail sub-views. Furthermore, there is no direct way from the catalog to inspect individual scale parameters or assemble a multi-scale screening battery (e.g., combining PHQ-9 + GAD-7) for an entire cohort.

---

## Solution Statement

1. **Card Action Refactoring**:
   - Move the online/offline toggle action into a top-right `more_horiz` menu button with status-aware actions.
   - Replace the card footer button with two buttons:
     - Text Button ("查看详情"): Opens a full-screen view wrapper.
     - Primary Button ("指派测评"): Invokes `useCreationOverlay().openCreation(...)` with the new assignment form.
2. **Full-Screen Scale View (`AssessmentScaleDetailsFullScreen.tsx`)**:
   - Uses the existing [`FullScreenView`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/FullScreenView.tsx) component.
   - Renders scale title, subtitle, duration, and question count in header, with a clean placeholder layout for upcoming scale editing/preview capabilities.
3. **Creation Overlay Assignment Form (`AssessmentAssignmentCreationForm.tsx`)**:
   - Embedded inside [`CreationSheetTemplate`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/creation-overlay/CreationSheetTemplate.tsx) with floating dock minimization support.
   - **Target Mode Switch**: Segmented toggle between "群体分发 (Cohort)" (College, Major, Academic Year/Grade, Class) and "指定学生 (Individual)" (searchable student dropdown/picker).
   - **Multi-Scale Battery Selector**: Pre-selects the clicked card's scale, allowing users to add/remove other active scales from the catalog (`/api/assessments/catalog`).
   - **Screening Parameters**: Optional deadline (截止时间) and remarks/instructions (分发说明/指导语).
   - **Execution**: Submits assignments to `/api/assessments/assignments`, shows feedback snackbar, invalidates query caches, and closes overlay.

---

## Feature Metadata

- **Feature Type**: Enhancement & New UI Workflow
- **Estimated Complexity**: Medium
- **Primary Systems Affected**:
  - `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`
  - `frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx`
  - `frontend/src/components/assessments/` (New `AssessmentAssignmentCreationForm.tsx`, `AssessmentScaleDetailsFullScreen.tsx`)
- **Dependencies**:
  - `@material/web` (Web Components)
  - `motion/react` (Framer Motion animations)
  - `@tanstack/react-query` (Cache management & fetching)
  - `lucide-react` / `material-symbols` (Icons)

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `frontend/src/components/admin/AssessmentCatalogManagementView.tsx` (lines 55-125) - Why: Current card layout, availability status rendering, and toggle dialog logic.
- `frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx` (lines 1-140) - Why: Existing unit test suite that must be updated for the new card buttons and 3-dots menu.
- `frontend/src/components/creation-overlay/CreationSheetTemplate.tsx` (lines 1-100) - Why: Container architecture for creation overlay sheets.
- `frontend/src/contexts/CreationContext.tsx` (lines 1-100) - Why: `openCreation`, `closeCreation`, `requestClose`, and `minimizeCreation` hook contract.
- `frontend/src/components/records/ReferralCreationForm.tsx` (lines 1-100, 250-400) - Why: Reference implementation of a full form inside `CreationOverlay` with form validation, snackbar, and header actions.
- `frontend/src/components/common/FullScreenView.tsx` (lines 1-70) - Why: Full-screen container with back button, header, and portal rendering.
- `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx` (lines 1-120) - Why: Assignment API consumption (`/api/assessments/assignments`), catalog fetching, and scale selection logic.
- `frontend/src/components/common/Buttons.tsx` (lines 1-80) - Why: `PrimaryButton`, `SecondaryButton`, `TertiaryButton`, `SegmentedButton` components.
- `frontend/src/types/index.ts` (lines 50-130) - Why: `AssessmentCatalogItemDto`, `Student`, `DemographicsDto`, `AssessmentScaleType`.

### New Files to Create

- `frontend/src/components/assessments/AssessmentAssignmentCreationForm.tsx` - Multi-scale cohort & student assignment form designed for `CreationOverlay`.
- `frontend/src/components/assessments/AssessmentAssignmentCreationForm.test.tsx` - Unit & interaction tests for the assignment creation form.
- `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.tsx` - Full-screen placeholder view for scale inspection.
- `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.test.tsx` - Unit tests for the full-screen view.

### Relevant Documentation YOU SHOULD READ THESE BEFORE IMPLEMENTING!

- [GEMINI.md](file:///Volumes/Files/Programming/medical-system/GEMINI.md) - Section: Coding Conventions, MSW Contract Rules, M3 Components, Zero `any`.
- [.ai/reference/components.md](file:///Volumes/Files/Programming/medical-system/.ai/reference/components.md) - UI Architecture & Creation Overlay patterns.

### Patterns to Follow

**Creation Overlay Opening Pattern (`ReferralCreationForm.tsx:L70-L80`):**
```tsx
const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();

const handleOpenAssign = (scale: AssessmentCatalogItemDto) => {
  openCreation(
    '指派心理测评',
    <AssessmentAssignmentCreationForm
      initialScale={scale}
      onClose={closeCreation}
    />
  );
};
```

**FullScreenView Triggering Pattern (`ProfileDetailsView.tsx:L25-L35`):**
```tsx
const [viewingScale, setViewingScale] = useState<AssessmentCatalogItemDto | null>(null);

// In JSX:
<AssessmentScaleDetailsFullScreen
  isOpen={!!viewingScale}
  scale={viewingScale}
  onClose={() => setViewingScale(null)}
/>
```

**M3 Button Hierarchy:**
- Primary Button: `PrimaryButton` with filled M3 styling (`bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]`).
- Text Button: `TertiaryButton` or M3 text button (`md-text-button` / `TertiaryButton`) for low-emphasis secondary actions.
- 3-Dots Button: `md-icon-button` with `more_horiz` icon for contextual menu/governance.

---

## IMPLEMENTATION PLAN

### Phase 1: Full-Screen Scale View & Foundation

Create the full-screen view component [`AssessmentScaleDetailsFullScreen.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.tsx) utilizing [`FullScreenView`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/common/FullScreenView.tsx).

**Tasks:**
- Build `AssessmentScaleDetailsFullScreen.tsx` with header metadata (scale title, code badge, category, duration, question count).
- Add clean placeholder body with empty state illustration, feature preview note, and back-button navigation.
- Add unit tests in `AssessmentScaleDetailsFullScreen.test.tsx`.

### Phase 2: Assessment Assignment Creation Form

Build the [`AssessmentAssignmentCreationForm.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentAssignmentCreationForm.tsx) component for the `CreationOverlay`.

**Tasks:**
- Implement target mode segmented switch: **群体分发 (Cohort)** vs **指定学生 (Individual)**.
- For **Cohort Mode**:
  - Provide cascading/independent selectors for College (学院), Major (专业), Academic Year/Grade (年级), and Class (班级), plus a "全校学生 (All Students)" option.
  - Display target student count / summary preview chip.
- For **Individual Mode**:
  - Provide a searchable student dropdown/selector fetching from `/api/students` with student number, name, and major.
- **Scale Battery Selection**:
  - Pre-populate with `initialScale`.
  - Fetch active scales from `/api/assessments/catalog`.
  - Allow adding more scales via a multi-select chip/dropdown list and removing added scales.
  - Calculate and display total questions and total estimated duration.
- **Assignment Parameters**:
  - Deadline picker / input (截止完成时间).
  - Instructions / Remarks textarea (测评指导语与备注).
- **Submission & Lifecycle**:
  - Handle form submission with loading indicators, sequential/batch assignment API calls, error handling, snackbar alerts, and query cache invalidation.
  - Register overlay header actions and close interceptors.
- Add unit tests in `AssessmentAssignmentCreationForm.test.tsx`.

### Phase 3: Card Refactoring & 3-Dots Menu in AssessmentCatalogManagementView

Update [`AssessmentCatalogManagementView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/admin/AssessmentCatalogManagementView.tsx).

**Tasks:**
- Add top-right 3-dots menu button on each card (`md-icon-button` with `more_horiz`) with a dropdown menu or direct toggle action triggering the hide confirmation dialog or enable action.
- Update card footer:
  - Left: Meta indicators (duration, question count, availability status dot).
  - Right: Button group containing:
    - Text Button: `TertiaryButton` ("查看详情") -> sets `viewingScale(item)`.
    - Primary Button: `PrimaryButton` ("指派测评") -> calls `handleOpenAssign(item)`.
- Mount `AssessmentScaleDetailsFullScreen` in `AssessmentCatalogManagementView`.

### Phase 4: Testing, Verification & Linting

**Tasks:**
- Update `AssessmentCatalogManagementView.test.tsx` to assert new buttons, dialog flows, and full-screen triggers.
- Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript contract errors.
- Run `npm run test` (`vitest`) to ensure 100% test pass rate across all frontend suites.

---

## STEP-BY-STEP TASKS

### Task 1: CREATE `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.tsx`

- **IMPLEMENT**: A full-screen overlay component using `FullScreenView`.
  - Accepts props: `isOpen: boolean`, `onClose: () => void`, `scale: AssessmentCatalogItemDto | null`.
  - Renders top bar with scale title, subtitle, battery code badge, duration, and question count.
  - Body contains a clean placeholder card with Material icon `quiz` / `description`, title "量表配置与题目明细", description "该量表的题目明细、临床因子常模与评分权重配置功能正在规划中。", and summary parameters.
- **PATTERN**: `frontend/src/components/common/FullScreenView.tsx:L26-L55`
- **IMPORTS**: `React`, `FullScreenView`, `AssessmentCatalogItemDto`, `PrimaryButton`, `TertiaryButton`.
- **VALIDATE**: `npm run lint`

---

### Task 2: CREATE `frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.test.tsx`

- **IMPLEMENT**: Vitest tests verifying:
  1. Renders nothing or hidden when `isOpen={false}`.
  2. Renders scale title, subtitle, battery code, and placeholder content when `isOpen={true}`.
  3. Calls `onClose` when clicking the back arrow button.
- **PATTERN**: `frontend/src/components/common/FullScreenView.test.tsx:L1-L40`
- **VALIDATE**: `npm run test -- frontend/src/components/assessments/AssessmentScaleDetailsFullScreen.test.tsx`

---

### Task 3: CREATE `frontend/src/components/assessments/AssessmentAssignmentCreationForm.tsx`

- **IMPLEMENT**:
  - Creation overlay form payload for assigning assessments.
  - State:
    - `targetType`: `'COHORT' | 'INDIVIDUAL'`
    - `cohort`: `{ college: string, major: string, grade: string, className: string }`
    - `selectedStudentId`: `string`
    - `selectedBatteryCodes`: `Set<string>` (initialized with `initialScale.batteryCode`)
    - `deadline`: `string`
    - `remarks`: `string`
    - `isSubmitting`: `boolean`
  - Integration with `useCreationOverlay`: sets header actions (or uses bottom action buttons) and close interceptor if form is dirty.
  - Query `/api/students` for student list when in individual mode.
  - Query `/api/assessments/catalog` to show available scales to add.
  - Submit handler: posts assignments to `/api/assessments/assignments`, shows success snackbar, invalidates query keys `['/api/assessments']`, `['/api/assessments/assignments']`, and closes overlay.
- **PATTERN**: `frontend/src/components/records/ReferralCreationForm.tsx:L15-L120`, `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx:L70-L120`
- **VALIDATE**: `npm run lint`

---

### Task 4: CREATE `frontend/src/components/assessments/AssessmentAssignmentCreationForm.test.tsx`

- **IMPLEMENT**: Vitest tests verifying:
  1. Renders initial selected scale name and target mode switch.
  2. Switches between Cohort and Individual modes.
  3. Allows adding and removing additional assessment scales.
  4. Submits assignment request and calls `onClose` upon success.
  5. Displays validation errors if required fields are missing.
- **PATTERN**: `frontend/src/components/records/ReferralActionFooter.test.tsx`, `frontend/src/components/assessments/AssessmentFlow.test.tsx`
- **VALIDATE**: `npm run test -- frontend/src/components/assessments/AssessmentAssignmentCreationForm.test.tsx`

---

### Task 5: UPDATE `frontend/src/components/admin/AssessmentCatalogManagementView.tsx`

- **IMPLEMENT**:
  - Add `useCreationOverlay()` hook import.
  - Add `viewingScale` state for `AssessmentScaleDetailsFullScreen`.
  - On each catalog card:
    - Top-right: Add `md-icon-button` with `more_horiz` (or a popup menu) to toggle visibility / trigger `pendingHideScale`.
    - Card footer action buttons:
      - `TertiaryButton` with label "查看详情" -> triggers `setViewingScale(item)`.
      - `PrimaryButton` with label "指派测评" -> triggers `openCreation('指派心理测评', <AssessmentAssignmentCreationForm initialScale={item} onClose={closeCreation} />)`.
  - Mount `<AssessmentScaleDetailsFullScreen isOpen={!!viewingScale} scale={viewingScale} onClose={() => setViewingScale(null)} />`.
- **PATTERN**: `frontend/src/components/admin/AssessmentCatalogManagementView.tsx:L55-L120`
- **GOTCHA**: Ensure card responsiveness across grid columns (1 col mobile, 2 col tablet, 3 col desktop). Ensure button text and meta pills do not overflow on narrow screens.
- **VALIDATE**: `npm run lint`

---

### Task 6: UPDATE `frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx`

- **IMPLEMENT**:
  - Update mock for `useCreationOverlay` to spy on `openCreation`.
  - Update test cases:
    1. Verify cards render "查看详情" and "指派测评" buttons.
    2. Verify clicking "查看详情" opens full-screen view.
    3. Verify clicking "指派测评" calls `openCreation` with the assignment form.
    4. Verify 3-dots button triggers the hide confirmation dialog or enable action.
- **PATTERN**: `frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx:L1-L140`
- **VALIDATE**: `npm run test -- frontend/src/components/admin/AssessmentCatalogManagementView.test.tsx`

---

## TESTING STRATEGY

### Unit Tests
- `AssessmentScaleDetailsFullScreen.test.tsx`: Verify open/close transitions, header metadata display, and back navigation.
- `AssessmentAssignmentCreationForm.test.tsx`: Verify cohort/student switching, scale selection chips, input validations, and API dispatch.
- `AssessmentCatalogManagementView.test.tsx`: Verify 2-button card layout, 3-dots menu trigger, full-screen opening, and creation overlay dispatch.

### Integration Tests
- Vitest tests using MSW mock handlers to verify end-to-end assignment form submission and query cache invalidation.

### Edge Cases
- Assigning when all other scales are already selected.
- Submitting without selecting any student in Individual mode.
- Closing creation overlay with unsaved changes (close warning/interceptor).
- Handling network failure gracefully during assignment submission.

---

## VALIDATION COMMANDS

### Level 1: Syntax & Style
```bash
cd frontend && npm run lint
```

### Level 2: Unit Tests
```bash
cd frontend && npm run test -- --run
```

### Level 3: Build Verification
```bash
cd frontend && npm run build
```

---

## ACCEPTANCE CRITERIA

- [ ] Assessment cards in `测评量表目录` display a Primary "指派测评" button and a Text "查看详情" button.
- [ ] Scale availability (online/offline) toggle is moved to a top-right 3-dots menu on each card, retaining the confirmation dialog when hiding.
- [ ] Clicking "查看详情" opens `AssessmentScaleDetailsFullScreen` with scale title and back button navigation.
- [ ] Clicking "指派测评" opens `AssessmentAssignmentCreationForm` inside `CreationOverlay`.
- [ ] The assignment form allows toggling between Cohort (College/Major/Grade/Class) and Individual Student mode.
- [ ] The assignment form pre-selects the clicked scale and allows adding/removing other scales from the catalog.
- [ ] The assignment form includes optional Deadline and Remarks fields.
- [ ] All unit tests pass with zero errors.
- [ ] `npm run lint` (`tsc --noEmit`) passes with zero TypeScript errors.
- [ ] Production build (`npm run build`) completes successfully.

---

## COMPLETION CHECKLIST

- [ ] Task 1: `AssessmentScaleDetailsFullScreen.tsx` created.
- [ ] Task 2: `AssessmentScaleDetailsFullScreen.test.tsx` created and passing.
- [ ] Task 3: `AssessmentAssignmentCreationForm.tsx` created.
- [ ] Task 4: `AssessmentAssignmentCreationForm.test.tsx` created and passing.
- [ ] Task 5: `AssessmentCatalogManagementView.tsx` updated with 2 buttons and 3-dots menu.
- [ ] Task 6: `AssessmentCatalogManagementView.test.tsx` updated and passing.
- [ ] All validation commands pass.
