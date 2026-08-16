# Feature: Refactor Side Panel & MetricCard Adaptive Layout System

The following plan must be strictly followed during implementation. Validate documentation and codebase patterns and execute validation commands after each step.

---

## Feature Description
Refactor the side panel drawer and `MetricCard` layout system across the frontend application. Replace brittle, imperative DOM scraping and layout-thrashing calculations (`calculateMinWidth`, `style.width = 'max-content'`, `dynamic-min-width-anchor`, `data-min-width-offset`) with standard design system dimensions (`SIDE_PANEL_DEFAULT_WIDTH = 480`, `SIDE_PANEL_MIN_WIDTH = 440`) and native **Tailwind CSS 4 Container Queries (`@container`)**. This resolves the bug where `ReferralDetailsView` cards overflow and ignore end padding when first opened after a page refresh.

---

## User Story
```
As a Teacher, Head Councillor, Doctor, or Trial Admin
I want the Referral and Student Details side panel to open immediately at an ergonomic, perfectly sized width with self-healing, adaptive cards
So that clinical metrics, triage info, and action tabs are clearly legible with generous padding across all viewports without text truncation or layout glitches
```

---

## Problem Statement
1. `MainContent.tsx` manages `sideWidth` initialized to `400px`.
2. It attempts to measure descendant DOM nodes using `calculateMinWidth()` on initial mount (`requestAnimationFrame`).
3. When `ReferralDetailsView` loads asynchronously via TanStack React Query (`useQuery`), it initially renders a loading skeleton. During this frame, `calculateMinWidth()` runs on the skeleton and returns `400px`.
4. When `useQuery` resolves and `ReferralOverviewTab` mounts, `MainContent` never recalculates, leaving the side drawer trapped at `400px`.
5. In a `400px` drawer (`352px` content area), 3-column `MetricCard`s requiring `419px` content width overflow into the right padding and collide with card borders.
6. The pattern mutates DOM inline styles (`style.width = 'max-content'`) forcing synchronous reflows and leaking layout markers (`.dynamic-min-width-anchor`, `data-min-width-offset`) into leaf view components.

---

## Solution Statement
1. **Branch Isolation**: Create and switch to feature branch `refactor/side-panel-container-layout` before editing code.
2. **Design Tokens & Constants**: Standardize `SIDE_PANEL_DEFAULT_WIDTH = 480`, `SIDE_PANEL_MIN_WIDTH = 440`, `SIDE_PANEL_MAX_WIDTH = 800` in `layoutConstants.ts` and deprecate imperative DOM anchor constants.
3. **Shell Simplification (`MainContent.tsx`)**:
   - Initialize `sideWidth` with `SIDE_PANEL_DEFAULT_WIDTH` (480px).
   - Remove `calculateMinWidth()`, DOM query selectors, inline style mutations, and `requestAnimationFrame` measurement effects.
   - Enforce pure mathematical bounds during drag resizing: `Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH)`.
   - Add `@container` to `#side-panel-wrapper`.
4. **Card Defensive Sizing (`DetailsPanel.tsx`)**:
   - Refine `MetricCard` padding to `py-3.5 px-4` to eliminate wasted horizontal space.
   - Add `min-w-0` and `truncate` to header labels and value badges to guarantee zero border overflow under any width.
   - Align `DetailsPanel` default `width` prop with `LAYOUT_CONSTANTS.SIDE_PANEL_DEFAULT_WIDTH`.
5. **Container-Query Driven Grids**:
   - Update `ReferralOverviewTab.tsx`, `ReferralDetailsView.tsx`, and `StudentDetailsView.tsx` to use responsive container query grids (`grid grid-cols-2 @[440px]:grid-cols-3 gap-3.5`).
   - Remove all `.dynamic-min-width-anchor` classes and `data-min-width-offset` attributes.
6. **Automated & Visual Verification**:
   - Run type checks (`tsc --noEmit`), Vitest suite (`vitest run`), and execute browser runtime evaluation to verify zero text collision or padding encroachment.

---

## Feature Metadata
- **Feature Type**: Architecture Refactor & UI Bug Fix
- **Estimated Complexity**: Low-Medium
- **Primary Systems Affected**: `layoutConstants.ts`, `MainContent.tsx`, `DetailsPanel.tsx`, `ReferralOverviewTab.tsx`, `ReferralDetailsView.tsx`, `StudentDetailsView.tsx`
- **Dependencies**: React 19, Tailwind CSS 4, Vitest, Testing Library

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: READ BEFORE IMPLEMENTING!
- `frontend/src/config/layoutConstants.ts` (lines 1-8) - Layout tokens.
- `frontend/src/components/layout/MainContent.tsx` (lines 10-150) - Side drawer container, resize logic, and current scraper code.
- `frontend/src/components/common/DetailsPanel.tsx` (lines 35-65, 135-199) - DetailsPanel shell and MetricCard implementation.
- `frontend/src/components/records/ReferralOverviewTab.tsx` (lines 43-145) - 3-column metric grids under "分诊基本信息".
- `frontend/src/components/records/ReferralDetailsView.tsx` (lines 170-205) - Referral details header anchor.
- `frontend/src/components/students/StudentDetailsView.tsx` (lines 140-185) - Student details grid anchors.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: BRANCH CREATION
- **COMMAND**: `git checkout -b refactor/side-panel-container-layout`
- **VALIDATE**: `git branch --show-current` (Must output `refactor/side-panel-container-layout`)

---

### Task 2: UPDATE `frontend/src/config/layoutConstants.ts`
- **IMPLEMENT**:
  - Add explicit sizing tokens:
    ```ts
    export const LAYOUT_CONSTANTS = {
      SIDE_PANEL_WRAPPER_ID: 'side-panel-wrapper',
      SIDE_PANEL_MIN_WIDTH: 440,
      SIDE_PANEL_DEFAULT_WIDTH: 480,
      SIDE_PANEL_MAX_WIDTH: 800,
      ACTION_FOOTER_CLASS: 'action-footer-content-wrapper',
      TABS_LIST_CLASS: 'details-tabs-list',
    } as const;
    ```
  - Remove `DYNAMIC_MIN_WIDTH_ANCHOR_CLASS` and `DYNAMIC_MIN_WIDTH_OFFSET_ATTR`.
- **VALIDATE**: `npx tsc --noEmit --project frontend/tsconfig.json`

---

### Task 3: REFACTOR `frontend/src/components/layout/MainContent.tsx`
- **IMPLEMENT**:
  - Initialize `const [sideWidth, setSideWidth] = React.useState<number>(LAYOUT_CONSTANTS.SIDE_PANEL_DEFAULT_WIDTH);`
  - In `resize()` callback:
    ```ts
    const minWidth = LAYOUT_CONSTANTS.SIDE_PANEL_MIN_WIDTH;
    const maxWidth = Math.min(LAYOUT_CONSTANTS.SIDE_PANEL_MAX_WIDTH, containerRect.width * 0.6);
    setSideWidth(Math.min(Math.max(newWidth, minWidth), maxWidth));
    ```
  - Remove `calculateMinWidth()`, `dragMinWidthRef`, and the `useEffect` with `requestAnimationFrame`.
  - Add `@container` to the side panel container element:
    ```tsx
    <div
      id={LAYOUT_CONSTANTS.SIDE_PANEL_WRAPPER_ID}
      style={{ width: sideWidth }}
      className="@container h-full flex flex-col shrink-0 overflow-hidden"
    >
    ```
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 4: REFACTOR `frontend/src/components/common/DetailsPanel.tsx`
- **IMPLEMENT**:
  - In `DetailsPanel`: default `width = LAYOUT_CONSTANTS.SIDE_PANEL_DEFAULT_WIDTH` (480).
  - In `MetricCard`:
    - Update container styling to `py-3.5 px-4 rounded-[20px] bg-[var(--md-sys-color-surface-container-low)] flex flex-col gap-2.5 min-w-0 overflow-hidden ${className}`.
    - In title row: `<div className={`flex items-center gap-1.5 min-w-0 ${labelClassName}`}>`.
    - In title icon: `<span className="material-symbols-outlined text-[18px] shrink-0">{icon}</span>`.
    - In title text: `<span className="text-[13px] font-bold truncate">{label}</span>`.
    - In value container: `<div className="flex items-center justify-between gap-1.5 min-w-0">` with value container `<div className="flex flex-1 min-w-0 overflow-hidden">`.
    - In value string badge: `<span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-bold truncate ${badgeClassName}`}>`.
- **VALIDATE**: `npm --prefix frontend run test -- src/components/common/DetailsPanel.test.tsx`

---

### Task 5: REFACTOR `frontend/src/components/records/ReferralOverviewTab.tsx`
- **IMPLEMENT**:
  - Remove imports or references to `DYNAMIC_MIN_WIDTH_ANCHOR_CLASS` and `DYNAMIC_MIN_WIDTH_OFFSET_ATTR`.
  - Update triage metrics grid:
    ```tsx
    <div className="grid grid-cols-2 @[440px]:grid-cols-3 gap-3">
      <MetricCard label="是否初诊" icon="person_add" value={...} />
      <MetricCard label="是否服药" icon="medication" value={...} />
      <MetricCard label="心理治疗" icon="monitoring" value={...} />
    </div>
    ```
  - Update risk assessment metrics grid:
    ```tsx
    <div className="grid grid-cols-2 @[440px]:grid-cols-3 gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <MetricCard label="自杀意念" icon="psychology" ... />
      <MetricCard label="自杀企图" icon="personal_injury" ... />
      <MetricCard label="自残行为" icon="healing" ... />
    </div>
    ```
- **VALIDATE**: `npm --prefix frontend run test -- src/components/records/ReferralOverviewTab.test.tsx`

---

### Task 6: REFACTOR `frontend/src/components/records/ReferralDetailsView.tsx`
- **IMPLEMENT**:
  - Remove `LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS` and `DYNAMIC_MIN_WIDTH_OFFSET_ATTR` from the header `div` (line 171).
  - Use clean flexbox layout:
    ```tsx
    <div className="flex items-center justify-between gap-4 flex-nowrap overflow-hidden">
    ```
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 7: REFACTOR `frontend/src/components/students/StudentDetailsView.tsx`
- **IMPLEMENT**:
  - Remove `LAYOUT_CONSTANTS.DYNAMIC_MIN_WIDTH_ANCHOR_CLASS` and `DYNAMIC_MIN_WIDTH_OFFSET_ATTR` from lines 145, 165, 175.
  - Update grids to responsive container query grids:
    ```tsx
    <div className="grid grid-cols-2 @[440px]:grid-cols-4 gap-3">
    ```
- **VALIDATE**: `npm --prefix frontend run lint`

---

### Task 8: RUN FULL TEST SUITE & TYPE CHECKING
- **IMPLEMENT**: Run full TypeScript linting and Vitest test runner across the frontend.
- **COMMANDS**:
  - `npm --prefix frontend run lint`
  - `npm --prefix frontend run test`
- **VALIDATE**: All tests and type checks pass with zero errors.

---

### Task 9: BROWSER AUTOMATION VISUAL VALIDATION
- **IMPLEMENT**: Use `agent-browser` to load the application, open a referral details view on page refresh, and verify:
  1. Panel opens smoothly at 480px width without layout jumps.
  2. All 6 metric cards under "分诊基本信息" ("是否初诊", "是否服药", "心理治疗", "自杀意念", "自杀企图", "自残行为") have generous internal padding (>= 16px right margin/padding).
  3. Resizing the side drawer down to 440px or expanding up to 800px maintains clean, legible formatting without any text overflow.
- **COMMAND**: `agent-browser open http://localhost:3000/medical-system/`
- **VALIDATE**: `agent-browser screenshot ./verification_after_refactor.png`

---

## ACCEPTANCE CRITERIA
- [ ] Feature branch `refactor/side-panel-container-layout` created and active.
- [ ] All imperative DOM scraping (`querySelector`, `style.width = 'max-content'`, `dynamic-min-width-anchor`, `data-min-width-offset`) deleted from codebase.
- [ ] `MainContent.tsx` defaults to `480px` and enforces bounded drag resizing between `440px` and `800px`.
- [ ] `#side-panel-wrapper` uses Tailwind CSS 4 `@container`.
- [ ] `MetricCard` text and badges never protrude beyond card borders under any container width.
- [ ] Grids in `ReferralOverviewTab` and `StudentDetailsView` adapt gracefully based on container width.
- [ ] `npm run lint` and `npm run test` pass with 0 errors.
- [ ] Browser runtime confirms 100% visual fidelity and zero padding encroachment upon page reload.
