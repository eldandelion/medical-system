# Architecture Specification: Referral Header Status Badge & Overview Tab Refactor

## 1. Context & Business Intent
- **Feature Goal**: Refactor the referral status display in the frontend. Currently, status is shown via a prominent `ReferralStatusCard` banner at the top of the "Overview" tab. The intent is to remove this banner from the overview tab and introduce a clickable, pill-shaped badge in the details view header.
- **Header Badge Placement**: Displayed alongside the existing risk level badge as a compound header badge: `[Status Badge] [Risk Level Badge]`.
- **Badge Specifications**:
  - Pill shape matching the risk level badge: `px-2.5 py-0.5 rounded-full text-[11px] font-bold`.
  - Neutral Material Design 3 container tokens: `bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]`.
  - Typography: Chinese label via `STATUS_LABELS[status]`, without indicator dot.
  - Interactive micro-interactions: `hover:bg-[var(--md-sys-color-surface-container-highest)]`, `active:scale-[0.98]`, `cursor-pointer`, focus ring for keyboard accessibility (`focus-visible:ring-2`).
  - Accessibility: Semantic `<button type="button">`, `title="点击查看转诊进度"`, `aria-label="点击查看转诊进度"`.
  - Action: Clicking triggers navigation to the `'tracker'` ("转诊进度") tab.

---

## 2. Component Design & State Management

### 2.1 State Hoisting in `ReferralDetailsView.tsx`
- Currently, `internalActiveTab` is scoped inside `ReferralDetailsPresenter`.
- To allow the header override badge to navigate tabs consistently in all states (loading, fetched, controlled, or uncontrolled):
  - Hoist `internalActiveTab` and `setActiveTab` to `ReferralDetailsView`.
  - Pass `activeTab` and `onTabChange` to `ReferralDetailsPresenter`.
  - Register `ReferralHeaderBadges` in `setHeaderOverride` for both the loading state and the presentation state.

### 2.2 Reusable `ReferralHeaderBadges` Component
```tsx
interface ReferralHeaderBadgesProps {
  status: string;
  riskLevel: string;
  onStatusClick: () => void;
}

export function ReferralHeaderBadges({ status, riskLevel, onStatusClick }: ReferralHeaderBadgesProps) {
  const statusLabel = STATUS_LABELS[status] || status || '未知状态';
  const riskLabel = RISK_LEVEL_LABELS[riskLevel] || riskLevel;
  const riskStyle = RISK_LEVEL_STYLES[riskLevel] || '';

  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onStatusClick();
        }}
        className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-[0.5px] shrink-0 whitespace-nowrap bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-[0.98] cursor-pointer transition-all border-0 outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
        title="点击查看转诊进度"
        aria-label="点击查看转诊进度"
      >
        {statusLabel}
      </button>
      <div className={`px-2.5 py-0.5 rounded-full flex items-center font-bold text-[11px] uppercase tracking-[0.5px] shrink-0 whitespace-nowrap ${riskStyle}`}>
        <span>{riskLabel}</span>
      </div>
    </div>
  );
}
```

### 2.3 `ReferralOverviewTab.tsx` Simplification
- Remove `<ReferralStatusCard />` component from the JSX.
- Remove `onNavigateToTracker?: () => void;` from `ReferralOverviewTabProps`.
- Remove unused imports (`ReferralStatusCard`, `STATUS_STYLES`, `STATUS_LABELS`).
- Update callers in `ReferralDetailsView.tsx` and `RecordDetailsView.tsx` to omit `onNavigateToTracker`.

---

## 3. Fullscreen & Multi-Viewport Continuity
- `DetailsPanel` feeds `effectiveBadge` directly into `FullScreenView`.
- In both drawer mode and fullscreen portal mode, the header button preserves synthetic events and active state updates.
- Clicking the badge in fullscreen mode activates the "转诊进度" tab in the left sidebar drawer and displays `ReferralTrackerTab` in the viewport.

---

## 4. Test Strategy
1. `ReferralOverviewTab.test.tsx`:
   - Replace the legacy test asserting `ReferralStatusCard` with an assertion verifying that the status card banner is not rendered.
2. `ReferralDetailsView.test.tsx`:
   - Update loading and mounted tests to verify compound header badge structure (`待分配` + `高`).
   - Add test clicking the status badge and asserting `onTabChange` is called with `'tracker'` and `ReferralTrackerTab` is displayed.
