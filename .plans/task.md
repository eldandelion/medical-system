# Implementation Plan: Student Details View Header Layout & DetailsPanel Delegation

## Overview
Refactor `<StudentDetailsView>` to delegate top header presentation to `<DetailsPanel>` via `DetailsContext.setHeaderOverride`, aligning it with the modern header architecture established in `ReferralDetailsView`.
1. Consume `useDetails()` to obtain `setHeaderOverride`.
2. In a `useEffect` hook, register compact header components: 32px initial avatar, student name as `title`, student number as `subtitle`, and pill-shaped risk factor indicator as `badge`.
3. Provide cleanup returning `setHeaderOverride?.(null)` upon component unmount.
4. Eliminate the redundant legacy inner header prop (`header={...}`) from `<ScrollableDetailsLayout>`, removing the 64px circular avatar and inner `h1`.
5. Pass `disableTitleOverride={true}` to `<ScrollableDetailsLayout>`.
6. Update the unit test suite (`StudentDetailsView.test.tsx`) to assert the `setHeaderOverride` lifecycle contract, verify the absence of legacy inner header elements / duplicate `h1`, and guarantee that all Overview tab metrics, academic info, and contact details remain fully functional.

---

## Requirements
- **Header Delegation**: Delegate avatar, title, subtitle, and risk level badge to `DetailsPanel` via `setHeaderOverride`.
- **Avatar Contract**: Circular 32px initial avatar (`w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0`) displaying first character of student name (fallback to `'?'`).
- **Title Contract**: Student name (`student.name`).
- **Subtitle Contract**: Student number (`student.studentNumber || 'N/A'`).
- **Badge Contract**: Pill badge (`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap`) displaying risk label (`RISK_LEVEL_LABELS[student.riskLevel || 'LOW'] || student.riskLevel || 'LOW'`) with risk styling (`RISK_LEVEL_STYLES[student.riskLevel || 'LOW']`).
- **Unmount Cleanup**: Invoke `setHeaderOverride?.(null)` upon component unmount.
- **ScrollableDetailsLayout**: Remove `header` prop entirely; pass `disableTitleOverride={true}`.
- **Test Integrity**: Assert `setHeaderOverride` registration payload and unmount cleanup in `StudentDetailsView.test.tsx`; assert that no legacy `h1` or inner header exists; verify Overview tab metrics, contact info, and copy-to-clipboard interactions pass without regressions.

---

## Writable Files
The execution is strictly limited to editing only the following 2 files:
1. `frontend/src/components/students/StudentDetailsView.tsx`
2. `frontend/src/components/students/StudentDetailsView.test.tsx`

---

## File-by-File Roadmap & Technical Specification

### 1. `frontend/src/components/students/StudentDetailsView.tsx`
- **Context Hook Consumption**:
  - Update `useDetails()` consumption to extract `setHeaderOverride`:
    ```tsx
    const { isFullScreen, setHeaderOverride } = useDetails();
    ```
- **Header Override Lifecycle Effect**:
  - Add `React.useEffect` binding to register header override with fallback handling:
    ```tsx
    const student = studentData || initialStudent;
    const studentNumber = student?.studentNumber || 'N/A';

    React.useEffect(() => {
      if (setHeaderOverride && student) {
        setHeaderOverride({
          avatar: (
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0">
              {student.name ? student.name.charAt(0) : '?'}
            </div>
          ),
          title: student.name,
          subtitle: studentNumber,
          badge: (
            <div className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[student.riskLevel || 'LOW'] || ''}`}>
              <span>{RISK_LEVEL_LABELS[student.riskLevel || 'LOW'] || student.riskLevel || 'LOW'}</span>
            </div>
          ),
        });
      }
      return () => {
        setHeaderOverride?.(null);
      };
    }, [setHeaderOverride, student, student?.name, studentNumber, student?.riskLevel]);
    ```
- **Inner Header Elimination**:
  - Remove `header={!hideHeader && !isFullScreen ? (...) : undefined}` prop from `<ScrollableDetailsLayout>`.
  - Pass `disableTitleOverride={true}` to `<ScrollableDetailsLayout>`:
    ```tsx
    return (
      <ScrollableDetailsLayout
        title={student.name}
        disableTitleOverride={true}
        className="min-w-[350px]"
        tabs={!isFullScreen ? (
          <SecondaryTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabType)}
          />
        ) : undefined}
        footer={...}
      >
        {/* Tab contents */}
      </ScrollableDetailsLayout>
    );
    ```

### 2. `frontend/src/components/students/StudentDetailsView.test.tsx`
- **Context Mock & Provider Enhancement**:
  - Import `DetailsContext` and `DetailsHeaderOverride`:
    ```tsx
    import { DetailsContext, DetailsHeaderOverride } from '../../contexts/DetailsContext';
    ```
  - Update `renderWithProviders` helper to wrap with `DetailsContext.Provider`:
    ```tsx
    const renderWithProviders = (
      ui: React.ReactElement,
      detailsContextValue: Partial<React.ComponentProps<typeof DetailsContext.Provider>['value']> = {}
    ) => {
      return render(
        <QueryClientProvider client={queryClient}>
          <DetailsContext.Provider value={{ isFullScreen: false, ...detailsContextValue }}>
            {ui}
          </DetailsContext.Provider>
        </QueryClientProvider>
      );
    };
    ```
- **Header Override Unit Tests**:
  - Test 1: `registers headerOverride with avatar, title, subtitle, and badge on mount`:
    - Provide `setHeaderOverride: setHeaderOverrideMock`.
    - Assert `setHeaderOverrideMock` is called with object having `title: '张伟'`, `subtitle: '2021001'`, `avatar`, and `badge`.
    - Render `avatar` and assert it contains first initial `'张'`.
    - Render `badge` and assert it contains label `'低'`.
  - Test 2: `cleans up headerOverride on unmount`:
    - Call `unmount()` and assert `expect(setHeaderOverrideMock).toHaveBeenLastCalledWith(null)`.
  - Test 3: `does not render legacy inner header or duplicate h1`:
    - Assert `screen.queryAllByRole('heading', { level: 1 })` has length 0.
    - Assert legacy 64px avatar (`.w-16.h-16`) is null in document.
  - Test 4: `gracefully falls back to N/A for studentNumber and LOW for riskLevel in headerOverride`:
    - Provide student with empty `studentNumber` and undefined `riskLevel`.
    - Assert `lastCall.subtitle === 'N/A'`.
    - Assert badge renders with `'低'`.
- **Overview Tab & Interaction Assertions**:
  - Update student number test: assert student number `'2021001'` is present in Overview tab under `'学籍信息'`.
  - Preserve all existing tests for:
    - Demographic, academic, and contact fields in `GroupedInfoList`.
    - Clipboard copy functionality for phone, ID card, and emergency contact.
    - Tab switching via `onTabChange`.

---

## Precise Task Execution Order (TDD)

### Phase 1: Test Suite Preparation (Red Phase)
1. **Update `StudentDetailsView.test.tsx`**:
   - Import `DetailsContext` and `DetailsHeaderOverride`.
   - Update `renderWithProviders` to accept custom `detailsContextValue`.
   - Add new tests:
     - `registers headerOverride with avatar, title, subtitle, and badge on mount`
     - `cleans up headerOverride on unmount`
     - `does not render legacy inner header or duplicate h1`
   - Update legacy header tests to assert `headerOverride` subtitle fallback instead of DOM `.font-mono` inner header.
   - Run tests (`npx vitest run StudentDetailsView.test.tsx`):
     - Confirm failure on new headerOverride assertions and absence of `h1` (Red state).

### Phase 2: Implementation in StudentDetailsView.tsx (Green Phase)
2. **Implement Header Delegation**:
   - In `StudentDetailsView.tsx`, destructure `setHeaderOverride` from `useDetails()`.
   - Implement `React.useEffect` hook registering avatar, title, subtitle, and badge, with unmount cleanup `setHeaderOverride?.(null)`.
   - Remove `header={!hideHeader && !isFullScreen ? (...) : undefined}` from `<ScrollableDetailsLayout>`.
   - Add `disableTitleOverride={true}` to `<ScrollableDetailsLayout>`.
3. **Verify Tests**:
   - Run Vitest: `npx vitest run StudentDetailsView.test.tsx`.
   - Confirm all tests in `StudentDetailsView.test.tsx` pass (Green state).

### Phase 3: Regression & Full Verification
4. **Run TypeScript Check**:
   - Execute `npm run lint` (`tsc --noEmit`) to verify zero type errors.
5. **Run Full Test Suite**:
   - Execute `npm run test -- run` to ensure no regressions in parent pages or surrounding modules (`DetailsPanel.test.tsx`, `ReferralDetailsView.test.tsx`, etc.).

---

## Testing Strategy
- **Unit Tests**:
  - `frontend/src/components/students/StudentDetailsView.test.tsx`:
    - `setHeaderOverride` registration on mount.
    - Subtitle fallback to `'N/A'` when student number is omitted.
    - Risk badge styling and label mapping.
    - Avatar initial extraction.
    - Unmount cleanup invoking `setHeaderOverride(null)`.
    - Absence of legacy inner `h1` and 64px avatar.
    - Full Overview tab field rendering and clipboard copy events.
    - Secondary tab navigation via `onTabChange`.
- **Integration & Regression Tests**:
  - `frontend/src/components/common/DetailsPanel.test.tsx`: Verify parent container renders overridden header correctly.
  - `frontend/src/components/records/ReferralDetailsView.test.tsx`: Verify referral header delegation consistency.

---

## Risks & Mitigations
- **Risk**: Stale `headerOverride` if student prop updates dynamically.
  - **Mitigation**: Include `student`, `student?.name`, `studentNumber`, and `student?.riskLevel` in `useEffect` dependency array so header updates when query resolves.
- **Risk**: Memory leak or leftover header state when switching details view.
  - **Mitigation**: Return cleanup function calling `setHeaderOverride?.(null)` on unmount.
- **Risk**: Duplicate titles or headers displayed in `DetailsPanel`.
  - **Mitigation**: Strictly pass `disableTitleOverride={true}` and remove `header` prop in `ScrollableDetailsLayout`.

---

## Success Criteria
- [ ] `setHeaderOverride` is called on mount with valid `avatar`, `title`, `subtitle`, and `badge`.
- [ ] `setHeaderOverride?.(null)` is called on component unmount.
- [ ] Redundant inner header inside `ScrollableDetailsLayout` is completely removed.
- [ ] `disableTitleOverride={true}` is set on `ScrollableDetailsLayout`.
- [ ] No `h1` or `.w-16.h-16` avatar element rendered in `StudentDetailsView` body.
- [ ] All Overview tab fields, metrics, and clipboard copy buttons continue to work.
- [ ] `StudentDetailsView.test.tsx` passes with 100% green status.
- [ ] `npm run lint` (`tsc --noEmit`) passes with 0 errors.
