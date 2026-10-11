# Implementation Plan: DetailsPanel Subtitle Compound Layout, Scroll-Collapse Removal & Subtitle Binding Prioritization

## Overview
Refactor `DetailsPanel` and related parent views to adopt the refined header design and cleanup scroll side-effects:
1. In `DetailsPanel`, nest `effectiveBadge` inside the subtitle flex container directly beside `effectiveSubtitle` (`[effectiveSubtitle] [effectiveBadge]`), eliminating the separate trailing badge column.
2. Remove `useScrollCollapse`, `CollapsibleHeader`, and scroll-based title synchronization in `ScrollableDetailsLayout` while keeping tabs sticky.
3. Standardize `<DetailsPanel subtitle={...}>` in the 5 parent pages (`DoctorPage.tsx`, `HeadCouncillorPage.tsx`, `TeacherPage.tsx`, `TrialAdminPage.tsx`, `AdminPage.tsx`) to prioritize `studentNumber || studentId` over `major`/`department`, preventing college from appearing in headers.
4. Ensure symmetric `headerOverride` registration in `ReferralDetailsView.tsx` across both loading and presenter states, verified by comprehensive unit tests.

---

## Writable Files
The execution agent is strictly limited to editing only the following 9 files:
1. `frontend/src/components/common/DetailsPanel.tsx`
2. `frontend/src/components/common/DetailsPanel.test.tsx`
3. `frontend/src/pages/DoctorPage.tsx`
4. `frontend/src/pages/HeadCouncillorPage.tsx`
5. `frontend/src/pages/TeacherPage.tsx`
6. `frontend/src/pages/TrialAdminPage.tsx`
7. `frontend/src/pages/AdminPage.tsx`
8. `frontend/src/components/records/ReferralDetailsView.tsx`
9. `frontend/src/components/records/ReferralDetailsView.test.tsx`

---

## File-by-File Roadmap & Technical Specification

### 1. `frontend/src/components/common/DetailsPanel.tsx`
- **Subtitle Row & Badge Layout**:
  - In `DetailsPanel` top bar, under `effectiveTitle`, replace the existing subtitle block:
    ```tsx
    <div className="flex flex-col min-w-0 truncate">
      <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] truncate leading-tight">
        {effectiveTitle}
      </span>
      {(effectiveSubtitle || effectiveBadge) && (
        <div className="flex items-center gap-2 min-w-0 mt-0.5">
          {effectiveSubtitle && (
            <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight font-mono">
              {effectiveSubtitle}
            </span>
          )}
          {effectiveBadge && (
            <div className="shrink-0 flex items-center">
              {effectiveBadge}
            </div>
          )}
        </div>
      )}
    </div>
    ```
  - Remove the standalone trailing `{effectiveBadge && (...)}` block that was placed after `<div className="flex flex-col min-w-0 truncate">`.
  - In `FullScreenView` prop binding within `DetailsPanel`, forward compound subtitle when either `effectiveSubtitle` or `effectiveBadge` is present:
    ```tsx
    subtitle={
      (effectiveSubtitle || effectiveBadge) ? (
        <div className="flex items-center gap-2">
          {effectiveSubtitle && <span>{effectiveSubtitle}</span>}
          {effectiveBadge}
        </div>
      ) : subtitle
    }
    ```
- **Removal of Scroll Collapse**:
  - Remove `useScrollCollapse` hook definition and exports.
  - Remove `CollapsibleHeader` component definition and exports.
  - Clean up `ScrollableDetailsLayout`:
    - Remove `const { isScrolled, handleScroll } = useScrollCollapse(20);`
    - Remove `setTitleOverride` scroll effects and `onScroll` binding.
    - Keep `title?: string; disableTitleOverride?: boolean;` in `ScrollableDetailsLayoutProps` as optional no-op properties to ensure backward compatibility with non-writable views (`UserDetailsView`, `StudentDetailsView`, `RecordDetailsView`).
    - Keep tabs sticky:
      ```tsx
      export function ScrollableDetailsLayout({
        header,
        tabs,
        footer,
        children,
        className = '',
      }: ScrollableDetailsLayoutProps) {
        return (
          <div className={`flex flex-col h-full bg-[var(--md-sys-color-surface)] relative overflow-hidden ${className}`}>
            <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden relative">
              {header && (
                <div className="p-6 pb-4 flex flex-col gap-5 shrink-0">
                  {header}
                </div>
              )}
              {tabs && (
                <div className="sticky top-0 z-20 bg-[var(--md-sys-color-surface)]">
                  {tabs}
                </div>
              )}
              <div className="flex-1 p-6 pb-8 min-h-[80vh]">
                {children}
              </div>
            </div>
            {footer}
          </div>
        );
      }
      ```

### 2. `frontend/src/components/common/DetailsPanel.test.tsx`
- **Remove Obsolete Tests & Helpers**:
  - Remove `ScrollWrapper` component.
  - Remove imports of `CollapsibleHeader` and `useScrollCollapse`.
  - Remove obsolete tests:
    - `handles scrolling with useScrollCollapse and CollapsibleHeader`
    - `ScrollableDetailsLayout handles scroll event and context`
    - `ScrollableDetailsLayout does not override title when disableTitleOverride is true`
- **Add & Update Layout Assertions**:
  - Add test: `renders effectiveSubtitle and effectiveBadge side-by-side in compound subtitle row in DetailsPanel`.
    - Render `DetailsPanel` with `subtitle="STU2026001"` and `badge={<span data-testid="test-badge">高风险</span>}`.
    - Assert both elements are inside the same flex row container beneath title.
  - Assert that when `headerOverride` provides both `subtitle` and `badge`, they are co-located in the subtitle container.
  - Add test verifying that in `FullScreenView`, the compound subtitle containing both subtitle and badge is rendered.

### 3. Parent Pages Subtitle Binding (`DoctorPage.tsx`, `HeadCouncillorPage.tsx`, `TeacherPage.tsx`, `TrialAdminPage.tsx`)
In each file's `<DetailsPanel>` invocation, update the `subtitle` prop to strictly prioritize `studentNumber` / `studentId` over major and college:
```tsx
subtitle={
  selectedItem?.studentNumber ||
  (selectedItem?.studentId ? String(selectedItem.studentId) : '') ||
  (selectedItem?.employeeId ? selectedItem?.department : '') ||
  (selectedItem?.type ? REFERRAL_TYPE_LABELS[selectedItem.type] || selectedItem.type : '') ||
  selectedItem?.major ||
  selectedItem?.department ||
  ''
}
```

### 4. `frontend/src/pages/AdminPage.tsx`
Update the `subtitle` prop passed to `<DetailsPanel>` to prioritize student identifier:
```tsx
subtitle={
  activePage === AdminTabs.USERS
    ? (selectedItem?.role === 'STUDENT'
        ? selectedItem?.employeeOrStudentId || selectedItem?.studentNumber || selectedItem?.studentId || ''
        : selectedItem?.email || selectedItem?.departmentOrCollege || '')
    : (activePage === AdminTabs.STUDENTS || activePage === AdminTabs.ASSESSMENTS)
    ? selectedItem?.studentNumber || selectedItem?.studentId || selectedItem?.major || ''
    : selectedItem?.studentNumber || selectedItem?.studentId || selectedItem?.studentName || ''
}
```

### 5. `frontend/src/components/records/ReferralDetailsView.tsx` & `ReferralDetailsView.test.tsx`
- **Symmetric Header Registration**:
  - Verify that both loading phase (`ReferralDetailsView`) and presenter phase (`ReferralDetailsPresenter`) register matching `headerOverride` payloads:
    - `avatar`: circular 32px (`w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]`) with student's first initial.
    - `title`: `referral.studentName`
    - `subtitle`: `referral.studentNumber || referralDetails.studentDemographics?.studentId || 'N/A'`
    - `badge`: pill indicator (`<div className="px-2.5 py-0.5 rounded-full ...">...</div>` with `RISK_LEVEL_STYLES[referral.riskLevel]`)
    - Cleanup on unmount: `setHeaderOverride?.(null)`
- **Verification in Test**:
  - In `ReferralDetailsView.test.tsx`, ensure existing tests for loading state and settled state verify exact symmetry of `headerOverride` (avatar, title, subtitle, badge) and unmount cleanup.

---

## Precise Task Execution Order (TDD)

### Phase 1: DetailsPanel Unit Tests & Header Layout Refactoring (Red -> Green)
1. **Update `DetailsPanel.test.tsx` (Red)**:
   - Remove obsolete imports of `useScrollCollapse`, `CollapsibleHeader`, and the 3 scroll-collapse tests.
   - Add unit tests verifying compound subtitle layout (`[effectiveSubtitle] [effectiveBadge]`) in side panel and `FullScreenView`.
   - Run tests: observe failure due to existing DOM structure or missing exports.
2. **Implement Refactor in `DetailsPanel.tsx` (Green)**:
   - Move `effectiveBadge` into subtitle flex container underneath `effectiveTitle`.
   - Remove standalone trailing badge div.
   - Remove `useScrollCollapse` and `CollapsibleHeader`.
   - Simplify `ScrollableDetailsLayout` (remove scroll title override, keep sticky tabs).
   - Run Vitest: `npx vitest run DetailsPanel.test.tsx` -> verify all pass.

### Phase 2: ReferralDetailsView Symmetry & Tests Verification
3. **Verify & Harden `ReferralDetailsView.tsx` & `ReferralDetailsView.test.tsx`**:
   - Verify symmetric registration of `headerOverride` between loading and presenter states.
   - Run Vitest: `npx vitest run ReferralDetailsView.test.tsx` -> verify all pass.

### Phase 3: Parent Pages Subtitle Binding Updates
4. **Update Parent Pages**:
   - `frontend/src/pages/DoctorPage.tsx`
   - `frontend/src/pages/HeadCouncillorPage.tsx`
   - `frontend/src/pages/TeacherPage.tsx`
   - `frontend/src/pages/TrialAdminPage.tsx`
   - `frontend/src/pages/AdminPage.tsx`
   - Prioritize `selectedItem?.studentNumber || selectedItem?.studentId` before major/department.

### Phase 4: Full Validation & Quality Gates
5. **Typecheck & Regression Testing**:
   - Run `npm run lint` (`tsc --noEmit`) to verify zero TypeScript errors across the repository.
   - Run full test suite: `npm run test -- run`.

---

## Success Criteria
- [ ] `useScrollCollapse` and `CollapsibleHeader` completely removed without breaking external consumers.
- [ ] Subtitle and risk badge pill rendered together within the same flex container under the title.
- [ ] No title swapping on scroll inside `ScrollableDetailsLayout`; tabs remain cleanly sticky.
- [ ] All 5 parent pages prioritize student number/ID in `<DetailsPanel subtitle={...}>`.
- [ ] `ReferralDetailsView` maintains symmetric header registration between loading and settled states.
- [ ] `tsc --noEmit` passes with 0 errors.
- [ ] All Vitest tests pass with 100% green status.
