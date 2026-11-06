# Implementation Plan: Mobile Intake Referral Views Bug Fix & UI Refinements

## Overview
This execution plan addresses visual regressions and Material Design 3 (MD3) styling polish across the Mobile Intake referral views (`mobile/`). The plan resolves font icon rendering failures caused by nonexistent `.material-symbols-rounded` class usage by standardizing to `.material-symbols-outlined`, removes unwanted border outlines and drop shadows from `ReferralCard.tsx` to align with MD3 flat card container specifications, replaces the generic `person` icon with an initial-character circular avatar badge styled with primary container tokens, and establishes rigorous TDD test gates in `ReferralCard.test.tsx` and `ReferralsPage.test.tsx`.

---

## Requirements & Scope

1. **Material Symbols Outlined Standardization**:
   - Replace all 25 occurrences of `material-symbols-rounded` with `material-symbols-outlined` across:
     - `mobile/src/components/referrals/ReferralCard.tsx`
     - `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx`
     - `mobile/src/components/referrals/ReferralFeedbackTab.tsx`
     - `mobile/src/components/referrals/ReferralOverviewTab.tsx`
     - `mobile/src/components/referrals/ReferralTrackerTab.tsx`
     - `mobile/src/pages/ReferralsPage.tsx`

2. **MD3 Flat Card Container Styling**:
   - Remove outline (`border border-[var(--md-sys-color-outline-variant)]`) and drop shadow (`shadow-sm`) from `ReferralCard.tsx`.
   - Preserve container background (`bg-[var(--md-sys-color-surface-container-low)]`), rounded corners (`rounded-2xl`), padding (`p-4`), and active states (`active:bg-[var(--md-sys-color-surface-container)] active:scale-[0.99]`).

3. **Initiator Placeholder Avatar Badge**:
   - In `ReferralCard.tsx`, replace the generic `person` icon with a circular avatar badge containing the first character of `referral.referredBy.name` (e.g., `'赵'` from `'赵辅导员'`).
   - Style with MD3 primary container tokens: `bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] rounded-full`.
   - Dimension: `h-4.5 w-4.5` (18px) with `text-[10px] font-semibold flex items-center justify-center shrink-0 select-none`.
   - Edge case defensive handling: trim whitespace before taking `charAt(0)`, and fallback gracefully if name is empty.

4. **Strict TDD Workflow**:
   - **RED Phase**: Update `ReferralCard.test.tsx` and `ReferralsPage.test.tsx` first with assertions verifying container classes, avatar badge rendering, absence of `person` icon, and `.material-symbols-outlined` usage.
   - Run Vitest to verify that tests fail against current code.
   - **GREEN Phase**: Apply code changes to source files until all unit and component tests pass.
   - **REFACTOR & AUDIT Phase**: Run `npm run lint` (`tsc --noEmit`) and full test suite (`npm run test`) to guarantee zero regressions.

---

## Explicit Writable Files

The execution agent is strictly permitted to modify ONLY the following files:

### 1. Test Files (`mobile/src/`)
- `mobile/src/components/referrals/ReferralCard.test.tsx` (Add tests for container border/shadow removal, initiator initial avatar badge, and outlined icon class)
- `mobile/src/pages/ReferralsPage.test.tsx` (Add assertion for empty state `material-symbols-outlined` icon class)

### 2. Component & Page Source Files (`mobile/src/`)
- `mobile/src/components/referrals/ReferralCard.tsx` (Card container classes, initiator avatar badge, icon classes)
- `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx` (Icon classes)
- `mobile/src/components/referrals/ReferralFeedbackTab.tsx` (Icon classes)
- `mobile/src/components/referrals/ReferralOverviewTab.tsx` (Icon classes)
- `mobile/src/components/referrals/ReferralTrackerTab.tsx` (Icon classes)
- `mobile/src/pages/ReferralsPage.tsx` (Empty state icon class)

### 3. Documentation
- `.plans/task.md`

---

## Step-by-Step Implementation Roadmap

### Phase 1: Test-Driven Specification (RED Phase)
1. **Add container styling, avatar badge, and outlined icon tests to ReferralCard**
   - **File**: `mobile/src/components/referrals/ReferralCard.test.tsx`
   - **Action**: Add unit tests:
     1. Verify card container className includes `rounded-2xl` and `bg-[var(--md-sys-color-surface-container-low)]`, but does NOT contain `border`, `border-[var(--md-sys-color-outline-variant)]`, or `shadow-sm`.
     2. Verify initiator badge renders initial character `'赵'` with `bg-[var(--md-sys-color-primary-container)]`, `text-[var(--md-sys-color-on-primary-container)]`, `rounded-full`, and verifies `screen.queryByText('person')` is `null`.
     3. Verify all icons use `.material-symbols-outlined` and zero elements use `.material-symbols-rounded`.
   - **Dependencies**: None
   - **Risk**: Low

2. **Add outlined icon assertion to ReferralsPage empty state test**
   - **File**: `mobile/src/pages/ReferralsPage.test.tsx`
   - **Action**: In the empty state test block, assert that the empty state icon element contains `.material-symbols-outlined` and not `.material-symbols-rounded`.
   - **Dependencies**: None
   - **Risk**: Low

3. **Verify Red State**
   - **Action**: Run `npm run test -- ReferralCard.test.tsx ReferralsPage.test.tsx` in `mobile/`.
   - **Expected**: Tests fail specifically on `border`, `shadow-sm`, missing avatar `'赵'`, and `.material-symbols-rounded` detection.

---

### Phase 2: ReferralCard Implementation (GREEN Phase 1)
4. **Refactor ReferralCard container, avatar, and icon classes**
   - **File**: `mobile/src/components/referrals/ReferralCard.tsx`
   - **Action**:
     - Remove `border border-[var(--md-sys-color-outline-variant)]` and `shadow-sm` from root container:
       ```tsx
       className="group relative cursor-pointer overflow-hidden rounded-2xl bg-[var(--md-sys-color-surface-container-low)] p-4 transition-all duration-200 active:scale-[0.99] active:bg-[var(--md-sys-color-surface-container)]"
       ```
     - Replace `<span className="material-symbols-rounded text-[14px]">person</span>` with:
       ```tsx
       <span
         className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[var(--md-sys-color-primary-container)] text-[10px] font-semibold text-[var(--md-sys-color-on-primary-container)] shrink-0 select-none"
         aria-hidden="true"
       >
         {referral.referredBy.name.trim().charAt(0)}
       </span>
       ```
     - Update all remaining icon classes to `material-symbols-outlined` (`arrow_forward`, `schedule`, `chevron_right`).
   - **Dependencies**: Steps 1 & 3
   - **Risk**: Low

5. **Verify ReferralCard tests pass green**
   - **Action**: Run `npx vitest run src/components/referrals/ReferralCard.test.tsx`.
   - **Expected**: All tests in `ReferralCard.test.tsx` pass cleanly.

---

### Phase 3: Outlined Icon Standardization across Detail Tabs & Root Page (GREEN Phase 2)
6. **Update ReferralsPage empty state icon**
   - **File**: `mobile/src/pages/ReferralsPage.tsx`
   - **Action**: Change `material-symbols-rounded` to `material-symbols-outlined` on line 81.
   - **Verification**: Run `npx vitest run src/pages/ReferralsPage.test.tsx` (passes green).

7. **Update ReferralDetailsFullScreen icons**
   - **File**: `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx`
   - **Action**: Replace `material-symbols-rounded` with `material-symbols-outlined` for:
     - Back button (`arrow_back`, line 107)
     - Header status pill arrow (`arrow_forward`, line 137)
     - Error state icon (`error_outline`, line 195)
   - **Verification**: Run `npx vitest run src/components/referrals/ReferralDetailsFullScreen.test.tsx`.

8. **Update ReferralOverviewTab icons**
   - **File**: `mobile/src/components/referrals/ReferralOverviewTab.tsx`
   - **Action**: Replace `material-symbols-rounded` with `material-symbols-outlined` for:
     - Triage metrics (`person_add` line 28, `medication` line 40, `monitoring` line 52)
     - Risk indicators (`psychology` line 80, `personal_injury` line 92, `healing` line 104)
     - Description quote (`format_quote` line 116)
     - Attachments (`attachment` line 138)

9. **Update ReferralTrackerTab icons**
   - **File**: `mobile/src/components/referrals/ReferralTrackerTab.tsx`
   - **Action**: Replace `material-symbols-rounded` with `material-symbols-outlined` for:
     - Step completion checkmark (`check`, line 107)
     - Step issue cross (`close`, line 109)
     - Step default icon (`{config.icon}`, line 111)
     - Destination card icon (`output_circle`, line 156)
     - Appointment card header icon (`event_available`, line 206)
     - Appointment calendar clock icon (`calendar_clock`, line 216)

10. **Update ReferralFeedbackTab icons**
    - **File**: `mobile/src/components/referrals/ReferralFeedbackTab.tsx`
    - **Action**: Replace `material-symbols-rounded` with `material-symbols-outlined` for:
      - Empty state pending icon (`pending_actions`, line 17)
      - Follow-up repeat icon (`repeat`, line 49)
      - Attachment icon (`description`, line 72)

---

### Phase 4: Full Suite Validation & Quality Gate Verification
11. **Grep audit for lingering `material-symbols-rounded` occurrences**
    - **Action**: Run search across `mobile/src/` to confirm 0 occurrences of `material-symbols-rounded`.
12. **Type check & Linter execution**
    - **Action**: Run `npm run lint` (`tsc --noEmit`) in `mobile/`.
13. **Full Vitest run**
    - **Action**: Run `npm run test` in `mobile/`. Ensure all test suites pass with 100% success rate.
14. **Production Build**
    - **Action**: Run `npm run build` in `mobile/` to confirm asset bundling completes without error.
