# Implementation Plan: Referral Details View Header Layout Modernization

## Overview
Modernize the Referral Details View header layout by moving the student header information (circular avatar placeholder, student name, student number subtitle, pill-shaped risk factor indicator) into the top header bar of `DetailsPanel` (side panel mode) and `FullScreenView` (expanded mode), on the same horizontal line as the expand and close action buttons.
- Eliminate the legacy inner header in `ReferralDetailsView` (which had a large 64px avatar, student name, college, and risk factor inside `ScrollableDetailsLayout`).
- Remove college completely from the header.
- Student number becomes a subtitle directly below the student name (matching font styling and opacity).
- Pill-shaped risk factor indicator is placed adjacent to the title & subtitle block in the side panel header, and inside the subtitle row in `FullScreenView`.
- In `DetailsPanel`, replace the default profile/description icon with the circular avatar placeholder when `headerOverride` is present.
- All other consumers of `DetailsPanel` (e.g. `StudentDetailsView`, `StaffDetailsView`, `UserDetailsView`) remain 100% backward-compatible.

---

## Writable Files
The execution agent is strictly permitted to edit only the following 7 files:
- `frontend/src/contexts/DetailsContext.tsx`
- `frontend/src/components/common/DetailsPanel.tsx`
- `frontend/src/components/common/DetailsPanel.test.tsx`
- `frontend/src/components/common/FullScreenView.tsx`
- `frontend/src/components/common/FullScreenView.test.tsx`
- `frontend/src/components/records/ReferralDetailsView.tsx`
- `frontend/src/components/records/ReferralDetailsView.test.tsx`

---

## File-by-File Roadmap & Exact Changes

### 1. `frontend/src/contexts/DetailsContext.tsx`
- **Objective**: Introduce strongly-typed `DetailsHeaderOverride`, eliminate `any[]` in `tabsOverride`, and add `headerOverride` & `setHeaderOverride` to `DetailsContextType`.
- **Exact Changes**:
```typescript
import * as React from 'react';

export interface DetailsHeaderOverride {
  avatar?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  badge?: React.ReactNode;
}

export interface DetailsTabItem {
  id: string;
  label: string;
  icon: string;
}

export interface DetailsContextType {
  isFullScreen: boolean;
  titleOverride?: string | null;
  setTitleOverride?: (title: string | null) => void;
  tabsOverride?: DetailsTabItem[] | null;
  setTabsOverride?: (tabs: DetailsTabItem[] | null) => void;
  headerOverride?: DetailsHeaderOverride | null;
  setHeaderOverride?: (header: DetailsHeaderOverride | null) => void;
}

export const DetailsContext = React.createContext<DetailsContextType>({
  isFullScreen: false,
});

export const useDetails = () => React.useContext(DetailsContext);
```

---

### 2. `frontend/src/components/common/DetailsPanel.tsx`
- **Objective**:
  1. Manage `headerOverride` state in `DetailsPanel` and reset it when `isOpen` becomes false.
  2. Derive effective slots (`effectiveAvatar`, `effectiveTitle`, `effectiveSubtitle`, `effectiveBadge`).
  3. Update top header bar layout: render `effectiveAvatar` if provided (replacing the default icon), render title and subtitle stacked vertically, and render `effectiveBadge` trailing them.
  4. Pass composite subtitle (with badge) and effective avatar to `FullScreenView`.
  5. Provide `headerOverride` and `setHeaderOverride` via `DetailsContext.Provider`.
  6. Add `disableTitleOverride?: boolean` to `ScrollableDetailsLayoutProps` and `ScrollableDetailsLayout` to prevent scroll collapse from overriding custom headers.
- **Exact Changes**:
  - **State**:
    ```typescript
    const [headerOverride, setHeaderOverride] = React.useState<DetailsHeaderOverride | null>(null);
    ```
  - **Reset**:
    ```typescript
    React.useEffect(() => {
      if (!isOpen) {
        setIsExpanded(false);
        setTitleOverride(null);
        setTabsOverride(null);
        setHeaderOverride(null);
      }
    }, [isOpen]);
    ```
  - **Derived slots**:
    ```typescript
    const effectiveAvatar = headerOverride?.avatar ?? headerAvatar;
    const effectiveTitle = headerOverride?.title ?? (titleOverride || title);
    const effectiveSubtitle = headerOverride?.subtitle ?? subtitle;
    const effectiveBadge = headerOverride?.badge;
    ```
  - **Top Bar Markup**:
    ```tsx
    <div className="flex items-center justify-between px-4 py-3 shrink-0 gap-2 border-b border-[var(--md-sys-color-outline-variant)] border-opacity-20">
      <div className="flex items-center gap-3 overflow-hidden min-w-0 flex-1">
        {effectiveAvatar ? (
          <div className="shrink-0 flex items-center justify-center">
            {effectiveAvatar}
          </div>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined shrink-0" style={{ color: iconColor, fontVariationSettings: "'FILL' 1" }}>
              {icon}
            </span>
          </div>
        )}

        <div className="flex flex-col min-w-0 truncate">
          <span className="text-[16px] font-medium text-[var(--md-sys-color-on-surface)] truncate leading-tight">
            {effectiveTitle}
          </span>
          {effectiveSubtitle && (
            <span className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight mt-0.5">
              {effectiveSubtitle}
            </span>
          )}
        </div>

        {effectiveBadge && (
          <div className="shrink-0 flex items-center">
            {effectiveBadge}
          </div>
        )}
      </div>

      <div className="flex items-center gap-0.5 shrink-0">
        <button
          onClick={() => onExpand ? onExpand() : setIsExpanded(true)}
          className="p-1.5 hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]"
          title="全屏"
          aria-label="全屏"
        >
          <span className="material-symbols-outlined text-[20px]">open_in_full</span>
        </button>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-[var(--md-sys-color-surface-variant)] rounded-full transition-colors flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]"
          title="关闭"
          aria-label="关闭"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>
    </div>
    ```
  - **Context Providers**:
    Supply `headerOverride` and `setHeaderOverride` to `DetailsContext.Provider` for both side panel and `FullScreenView`.
  - **FullScreenView Invocation**:
    ```tsx
    <FullScreenView
      isOpen={isExpanded}
      onClose={() => setIsExpanded(false)}
      title={headerOverride?.title ? (typeof headerOverride.title === 'string' ? headerOverride.title : title) : title}
      subtitle={
        headerOverride ? (
          <div className="flex items-center gap-2">
            <span>{headerOverride.subtitle}</span>
            {headerOverride.badge}
          </div>
        ) : subtitle
      }
      avatar={effectiveAvatar}
      tabs={tabsOverride || tabs}
      activeTab={activeTab}
      onTabChange={onTabChange}
    >
      ...
    </FullScreenView>
    ```
  - **ScrollableDetailsLayout**:
    ```typescript
    interface ScrollableDetailsLayoutProps {
      header?: React.ReactNode;
      tabs?: React.ReactNode;
      footer?: React.ReactNode;
      children: React.ReactNode;
      className?: string;
      title?: string;
      disableTitleOverride?: boolean;
    }

    export function ScrollableDetailsLayout({
      header,
      tabs,
      footer,
      children,
      className = '',
      title,
      disableTitleOverride = false
    }: ScrollableDetailsLayoutProps) {
      const { isScrolled, handleScroll } = useScrollCollapse(20);
      const { setTitleOverride } = React.useContext(DetailsContext);

      React.useEffect(() => {
        if (disableTitleOverride) return;
        if (setTitleOverride) {
          if (isScrolled && title) {
            setTitleOverride(title);
          } else {
            setTitleOverride(null);
          }
        }
      }, [isScrolled, title, setTitleOverride, disableTitleOverride]);
    ```

---

### 3. `frontend/src/components/common/FullScreenView.tsx`
- **Objective**: Widen `subtitle` prop type from `string` to `React.ReactNode` so composite subtitles (student number + risk badge pill) can be passed directly, and use a `<div>` wrapper instead of `<span>` to prevent invalid DOM nesting (`<div>` inside `<span>`).
- **Exact Changes**:
  ```typescript
  interface FullScreenViewProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    subtitle?: React.ReactNode;
    avatar?: React.ReactNode;
    tabs?: FullScreenTab[];
    activeTab?: string;
    onTabChange?: (tabId: string) => void;
    children: React.ReactNode;
    sidebar?: React.ReactNode;
    actions?: React.ReactNode;
    progress?: number;
  }
  ```
  In the header markup:
  ```tsx
  <div className="flex flex-col min-w-0 flex-1">
    <h1 className="text-[18px] font-medium text-[var(--md-sys-color-on-surface)] truncate leading-tight">{title}</h1>
    {subtitle && (
      <div className="text-[12px] text-[var(--md-sys-color-on-surface-variant)] truncate leading-tight opacity-70">
        {subtitle}
      </div>
    )}
  </div>
  ```

---

### 4. `frontend/src/components/records/ReferralDetailsView.tsx`
- **Objective**:
  1. Remove legacy inner header from `ScrollableDetailsLayout` in both loading state and settled state (`ReferralDetailsPresenter`).
  2. Set `disableTitleOverride={true}` on `ScrollableDetailsLayout`.
  3. Register `headerOverride` in `useEffect` with circular avatar, student name, student number subtitle, and pill risk badge during loading state.
  4. Register `headerOverride` in `useEffect` in `ReferralDetailsPresenter` with settled student demographics and risk badge, with cleanup on unmount (`setHeaderOverride(null)`).
  5. Completely remove college and legacy 64px avatar markup.
- **Exact Changes**:
  - In `ReferralDetailsView` (loading branch):
    ```tsx
    const { setHeaderOverride } = useDetails();
    React.useEffect(() => {
      if (setHeaderOverride && props.referral) {
        setHeaderOverride({
          avatar: (
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0">
              {props.referral.studentName ? props.referral.studentName.charAt(0) : '?'}
            </div>
          ),
          title: props.referral.studentName,
          subtitle: props.referral.studentNumber || 'N/A',
          badge: (
            <div className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[props.referral.riskLevel] || ''}`}>
              <span>{RISK_LEVEL_LABELS[props.referral.riskLevel] || props.referral.riskLevel}</span>
            </div>
          ),
        });
      }
      return () => {
        setHeaderOverride?.(null);
      };
    }, [setHeaderOverride, props.referral]);

    return (
      <ScrollableDetailsLayout
        title="加载中..."
        disableTitleOverride={true}
      >
        <div className="flex flex-col gap-6 animate-pulse p-2 pt-6">
          <div className="h-40 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          <div className="h-64 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
          <div className="h-32 bg-[var(--md-sys-color-surface-variant)] rounded-2xl opacity-30" />
        </div>
      </ScrollableDetailsLayout>
    );
    ```
  - In `ReferralDetailsPresenter`:
    ```tsx
    const { isFullScreen, setTabsOverride, setHeaderOverride } = useDetails();

    const studentNumber = referral.studentNumber || referralDetails.studentDemographics?.studentId || 'N/A';

    React.useEffect(() => {
      if (setHeaderOverride) {
        setHeaderOverride({
          avatar: (
            <div className="w-8 h-8 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center text-[14px] font-medium shrink-0">
              {referral.studentName ? referral.studentName.charAt(0) : '?'}
            </div>
          ),
          title: referral.studentName,
          subtitle: studentNumber,
          badge: (
            <div className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${RISK_LEVEL_STYLES[referral.riskLevel] || ''}`}>
              <span>{RISK_LEVEL_LABELS[referral.riskLevel] || referral.riskLevel}</span>
            </div>
          ),
        });
      }
      return () => {
        setHeaderOverride?.(null);
      };
    }, [setHeaderOverride, referral.studentName, studentNumber, referral.riskLevel]);

    return (
      <ScrollableDetailsLayout
        title={referral.studentName}
        disableTitleOverride={true}
        tabs={!isFullScreen ? (
          <SecondaryTabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(id) => setActiveTab(id as TabType)}
          />
        ) : undefined}
        footer={
          <ReferralActionFooter
            referral={referral}
            actions={actions}
            state={state}
          />
        }
      >
        {/* Tab content without old inner header */}
      ...
    ```

---

## Detailed TDD Test Cases

### 1. `frontend/src/components/common/DetailsPanel.test.tsx`
Add test suite `DetailsPanel Header Override`:
- **Test 1**: `renders headerOverride (avatar, title, subtitle, badge) when set by child via DetailsContext`
  - Render a child component that calls `setHeaderOverride({ avatar: <div data-testid="custom-avatar">AV</div>, title: 'Custom Student', subtitle: 'STU12345', badge: <span data-testid="custom-badge">HIGH</span> })`.
  - Assert `screen.getByTestId('custom-avatar')` is rendered.
  - Assert `screen.getByText('Custom Student')` and `screen.getByText('STU12345')` are rendered.
  - Assert `screen.getByTestId('custom-badge')` is rendered in the top header.
  - Assert default icon is replaced by the custom avatar.
- **Test 2**: `falls back to default props when headerOverride is cleared or null`
  - Mount with override, then unmount child or call `setHeaderOverride(null)`.
  - Assert default icon and title return.
- **Test 3**: `passes compound subtitle and avatar to FullScreenView when expanded with headerOverride`
  - Trigger expansion (`fireEvent.click(screen.getByText('open_in_full'))`).
  - Verify `FullScreenView` renders custom avatar, title, and compound subtitle with badge.
- **Test 4**: `ScrollableDetailsLayout does not override title when disableTitleOverride is true`
  - Render `ScrollableDetailsLayout` inside context with mock `setTitleOverride` and `disableTitleOverride={true}`.
  - Trigger scroll event on scroll container.
  - Assert `setTitleOverride` is NOT called with `Dynamic Title`.

### 2. `frontend/src/components/common/FullScreenView.test.tsx`
Add test cases in `FullScreenView.test.tsx`:
- **Test 1**: `renders string subtitle correctly (backward compatibility)`
  - Render with `subtitle="Simple Subtitle"`. Assert `screen.getByText('Simple Subtitle')` exists.
- **Test 2**: `renders ReactNode subtitle containing student number and risk badge`
  - Render with:
    ```tsx
    subtitle={
      <div data-testid="custom-sub">
        <span>STU2026001</span>
        <span data-testid="risk-pill">高风险</span>
      </div>
    }
    ```
  - Assert `screen.getByTestId('custom-sub')`, `screen.getByText('STU2026001')`, and `screen.getByTestId('risk-pill')` are properly rendered in the header.

### 3. `frontend/src/components/records/ReferralDetailsView.test.tsx` (New Test File)
Create test suite for `ReferralDetailsView`:
- **Test 1**: `registers headerOverride in DetailsContext during loading state`
  - Provide mock `setHeaderOverride` in `DetailsContext.Provider`.
  - Render `ReferralDetailsView` with loading query.
  - Assert `setHeaderOverride` was called with object containing avatar, title (`mockReferral.studentName`), subtitle (`mockReferral.studentNumber`), and badge.
  - Assert no inner header with 64px avatar or college is present in loading layout.
- **Test 2**: `registers headerOverride in DetailsContext on settled state and cleans up on unmount`
  - Mock successful query response for `ReferralDetails`.
  - Render `ReferralDetailsView` inside context with mock `setHeaderOverride`.
  - Assert `setHeaderOverride` called with student name, student number subtitle, risk badge.
  - Unmount component: assert `setHeaderOverride` called with `null`.
- **Test 3**: `eliminates inner header: removes college and 64px avatar, renders tabs and content cleanly`
  - Assert text of college (e.g. `'计算机科学与技术学院'`) does NOT appear in the layout header.
  - Assert student number is registered in subtitle, not inside an inner header block.
  - Assert `ScrollableDetailsLayout` rendered with `disableTitleOverride={true}`.

---

## Precise Task Execution Order (TDD)

1. **Step 1: Context Contract Update**
   - File: `frontend/src/contexts/DetailsContext.tsx`
   - Define `DetailsHeaderOverride`, `DetailsTabItem`, update `DetailsContextType` with `headerOverride` and `setHeaderOverride`. Remove `any[]`.
2. **Step 2: FullScreenView Subtitle ReactNode Support & Tests**
   - Write tests in `frontend/src/components/common/FullScreenView.test.tsx`.
   - Update `frontend/src/components/common/FullScreenView.tsx` (`subtitle?: React.ReactNode`).
   - Run Vitest: `npx vitest run FullScreenView.test.tsx`.
3. **Step 3: DetailsPanel Header Override & ScrollableDetailsLayout Support & Tests**
   - Write tests in `frontend/src/components/common/DetailsPanel.test.tsx` for `headerOverride`, fallback, FullScreenView forwarding, and `disableTitleOverride`.
   - Implement changes in `frontend/src/components/common/DetailsPanel.tsx`.
   - Run Vitest: `npx vitest run DetailsPanel.test.tsx`.
4. **Step 4: ReferralDetailsView Tests & Header Layout Migration**
   - Create `frontend/src/components/records/ReferralDetailsView.test.tsx` covering loading and settled states, context registration, and inner header elimination.
   - Refactor `frontend/src/components/records/ReferralDetailsView.tsx`: eliminate legacy inner header, remove college, pass `disableTitleOverride={true}`, and register `headerOverride` in both loading and settled states.
   - Run Vitest: `npx vitest run ReferralDetailsView.test.tsx`.
5. **Step 5: Full Suite & TypeScript Typecheck Verification**
   - Run `npm run lint` (`tsc --noEmit`).
   - Run full frontend tests: `npm run test -- run`.
   - Ensure 100% green tests and zero type errors.

---

## Success Criteria & Invariants
- [ ] Circular avatar replaces the default icon in `DetailsPanel` top bar when `headerOverride` is active.
- [ ] Student number appears as subtitle below student name; college is completely removed.
- [ ] Risk indicator pill is displayed in the top bar beside the title/subtitle block in side panel, and in subtitle section in FullScreenView.
- [ ] No regression or visual breakage for `StudentDetailsView`, `StaffDetailsView`, or `UserDetailsView`.
- [ ] `tsc --noEmit` passes with 0 errors (strict TypeScript zero-`any`).
- [ ] All Vitest unit tests pass cleanly.
