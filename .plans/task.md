# Implementation Plan: Referral Header Status Badge & Overview Tab Refactor

## Overview
Refactor the referral status display across the application by removing the prominent `ReferralStatusCard` banner from `ReferralOverviewTab` and introducing an interactive, pill-shaped compound status badge (`[Status Badge] [Risk Level Badge]`) in `ReferralDetailsView`'s header override. Clicking the status badge navigates directly to the "转诊进度" (`tracker`) tab.

---

## Locked Requirements
1. **Remove Overview Status Banner**:
   - Eliminate `<ReferralStatusCard />` from `ReferralOverviewTab.tsx`.
   - Remove `onNavigateToTracker` callback prop from `ReferralOverviewTabProps`.
   - Clean up unused imports (`ReferralStatusCard`, `STATUS_STYLES`, `STATUS_LABELS`) and dead variables.
2. **Compound Header Badge in `ReferralDetailsView`**:
   - Implement reusable `ReferralHeaderBadges` displaying `[Status Badge Button] [Risk Level Badge]`.
   - Pill shape matching the risk level badge: `px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-[0.5px] shrink-0 whitespace-nowrap`.
   - Material Design 3 container tokens: `bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] active:scale-[0.98]`.
   - Typography & Accessibility: Localized label via `STATUS_LABELS[status]`, semantic `<button type="button">`, `title="点击查看转诊进度"`, `aria-label="点击查看转诊进度"`, `focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]`.
   - Stop click propagation (`e.stopPropagation()`) and trigger navigation to `'tracker'` tab.
3. **State Hoisting**:
   - Hoist `internalActiveTab` and tab change handler to `ReferralDetailsView` so that clicking the header badge transitions tabs consistently across loading, mounted, controlled, and uncontrolled states.
   - Register `ReferralHeaderBadges` in `setHeaderOverride` during both loading state and presenter mounted state.
4. **Caller Alignment**:
   - Update `RecordDetailsView.tsx` to omit `onNavigateToTracker` when rendering `<ReferralOverviewTab />`.

---

## Writable Files
The execution is strictly limited to the following 5 files:
1. `frontend/src/components/records/ReferralOverviewTab.tsx`
2. `frontend/src/components/records/ReferralDetailsView.tsx`
3. `frontend/src/components/records/RecordDetailsView.tsx`
4. `frontend/src/components/records/ReferralOverviewTab.test.tsx`
5. `frontend/src/components/records/ReferralDetailsView.test.tsx`

---

## Test-Driven Development (TDD) Breakdown

### Phase 1: Red Phase (Failing & Updated Unit Tests)

#### 1. `frontend/src/components/records/ReferralOverviewTab.test.tsx`
- Replace legacy test asserting `ReferralStatusCard` with an assertion verifying that `ReferralStatusCard` banner is NOT rendered.
- Remove obsolete `onNavigateToTracker` prop in tests.

#### 2. `frontend/src/components/records/ReferralDetailsView.test.tsx`
- Update loading state test to assert the compound badge (`'待分配'` button + `'高'` risk badge).
- Update mounted state test to assert the compound badge.
- Add test asserting clicking the status badge button calls `onTabChange` with `'tracker'` and transitions the active view tab to `ReferralTrackerTab`.

---

### Phase 2: Green Phase (Implementation Changes)

#### 1. `frontend/src/components/records/ReferralOverviewTab.tsx`
- Remove unused imports (`ReferralStatusCard`, `STATUS_STYLES`, `STATUS_LABELS`).
- Remove `onNavigateToTracker` from `ReferralOverviewTabProps` and component parameters.
- Remove `<ReferralStatusCard />` JSX block and unused variables (`displayStatus`, `activeStep`).

#### 2. `frontend/src/components/records/RecordDetailsView.tsx`
- Remove `onNavigateToTracker` prop from `<ReferralOverviewTab />`.

#### 3. `frontend/src/components/records/ReferralDetailsView.tsx`
- Import `STATUS_LABELS` from `../../config/styleConstants`.
- Add and export `ReferralHeaderBadges` component.
- Hoist `internalActiveTab` and `handleTabChange` to `ReferralDetailsView`.
- In loading state `setHeaderOverride`: provide `ReferralHeaderBadges`.
- In mounted state `setHeaderOverride`: provide `ReferralHeaderBadges`.
- In `ReferralDetailsPresenter`: pass hoisted tab state and remove `onNavigateToTracker` from `<ReferralOverviewTab />`.

---

## Step-by-Step Task Order
1. **Red Phase**: Update unit tests in `ReferralOverviewTab.test.tsx` and `ReferralDetailsView.test.tsx`.
2. **Green Phase**:
   - Update `ReferralOverviewTab.tsx` to remove status card and obsolete props.
   - Update `RecordDetailsView.tsx` to align props.
   - Update `ReferralDetailsView.tsx` with `ReferralHeaderBadges` and hoisted state.
3. **Verify**:
   - Run Vitest tests on modified components.
   - Run `npm run lint` (`tsc --noEmit`).
   - Run full frontend test suite.

---

## Acceptance Criteria
- [ ] `ReferralOverviewTab` no longer renders `<ReferralStatusCard />` or any status banner.
- [ ] `ReferralOverviewTabProps` no longer requires or accepts `onNavigateToTracker`.
- [ ] `RecordDetailsView` renders `ReferralOverviewTab` cleanly without `onNavigateToTracker`.
- [ ] Details header displays the compound badge `[Status Badge Button] [Risk Level Badge]`.
- [ ] The status badge has MD3 surface tokens, hover and active states, focus ring, and accessibility attributes (`title="点击查看转诊进度"`, `aria-label="点击查看转诊进度"`).
- [ ] Clicking the status badge switches the active view tab to `'tracker'`.
- [ ] `npm test` passes for `ReferralOverviewTab.test.tsx` and `ReferralDetailsView.test.tsx`.
- [ ] `npm run lint` (`tsc --noEmit`) completes with 0 errors.
