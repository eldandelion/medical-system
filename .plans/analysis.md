# Analysis & Architecture: Mobile Referral View Polish & Bug Fixes

## 1. Problem Statement & Scope

1. **Icons Not Loading**:
   On the mobile intake referral views, icons rendered as plain raw text (e.g. "person", "arrow_forward", "schedule", "circle", "check") instead of vector icon glyphs.
   *Root Cause*: `mobile/src/main.tsx` imports `material-symbols/outlined.css`, defining `.material-symbols-outlined` with font-family `'Material Symbols Outlined'`. The referral views authored in `mobile/src/components/referrals/*` and `mobile/src/pages/ReferralsPage.tsx` mistakenly used the nonexistent `.material-symbols-rounded` class.

2. **Card Container Outline & Elevation**:
   `ReferralCard.tsx` used `border border-[var(--md-sys-color-outline-variant)]` and `shadow-sm`. Under Material Design 3 guidelines for mobile flat cards, container color differentiation (`bg-[var(--md-sys-color-surface-container-low)]`) without outlines or drop shadows should be used.

3. **Initiator Placeholder Avatar**:
   `ReferralCard.tsx` rendered a generic `person` icon for the initiator. The requirement is to replace it with a circular placeholder avatar badge showing the initiator's first character (e.g. "赵" for "赵辅导员", "艾" for "艾米丽") with MD3 primary container styling (`bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]`).

## 2. Technical Solution Design

### 2.1 Material Symbols Outlined Standardization
Replace all 22 occurrences of `material-symbols-rounded` with `material-symbols-outlined`:
- `ReferralCard.tsx`: Status navigation arrow, schedule icon, chevron icon.
- `ReferralDetailsFullScreen.tsx`: Back button arrow, header status pill arrow, error state icon.
- `ReferralFeedbackTab.tsx`: Empty state icon, repeat icon, attachment icon.
- `ReferralOverviewTab.tsx`: Triage category icons (first visit, medication, prior therapy), risk assessment icons (psychology, personal injury, healing), quote icon, attachment icon.
- `ReferralTrackerTab.tsx`: Completed step checkmark, issue step close icon, default step icon, destination output icon, appointment event icon, appointment calendar clock icon.
- `ReferralsPage.tsx`: Empty state icon.

### 2.2 ReferralCard Styling Modernization
- **Container**: Strip `border border-[var(--md-sys-color-outline-variant)]` and `shadow-sm`. Maintain `rounded-2xl bg-[var(--md-sys-color-surface-container-low)] p-4`.
- **Initiator Avatar**: Replace the `person` icon with:
  ```tsx
  <span
    className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--md-sys-color-primary-container)] text-[10px] font-semibold text-[var(--md-sys-color-on-primary-container)] shrink-0 select-none"
    aria-hidden="true"
  >
    {referral.referredBy.name.trim().charAt(0)}
  </span>
  ```

## 3. Impacted Files & Regression Invariants
- `mobile/src/components/referrals/ReferralCard.tsx`
- `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx`
- `mobile/src/components/referrals/ReferralFeedbackTab.tsx`
- `mobile/src/components/referrals/ReferralOverviewTab.tsx`
- `mobile/src/components/referrals/ReferralTrackerTab.tsx`
- `mobile/src/pages/ReferralsPage.tsx`
- `mobile/src/components/referrals/ReferralCard.test.tsx` (new tests for styling & avatar)
- `mobile/src/pages/ReferralsPage.test.tsx` (updated icon assertions)
