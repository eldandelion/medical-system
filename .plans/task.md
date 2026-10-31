# Implementation Plan: Mobile Intake Referrals Tab ("就医转诊") & Fullscreen Details View

## Overview
This implementation plan establishes a dedicated **就医转诊 (Referrals)** tab and MD3-compliant **Fullscreen Referral Details View** within the Mobile Intake application (`mobile/`). The solution integrates with Spring Boot referral endpoints (`/api/referrals`, `/api/referrals/{id}`, `/api/referrals/{id}/tracking`), enforces strict read-only bounded projection and ACL filtering for students, provides desktop presentation parity (triage metrics, severe risk indicators, 6-step timeline tracking, appointment cards, doctor feedback), and delivers mobile-first ergonomics with dynamic scroll-triggered header synchronization across a 3-destination bottom navigation bar.

---

## Requirements & Bounded Context Alignment

### Domain Invariants & Security
1. **Read-Only Student Projection**: Emitted `ReferralDto.availableActions` is always empty for students. The mobile intake interface is strictly a read-only projection without state modification triggers.
2. **Defensive Exclusion of Drafts & Recalls**: Upstream backend filters out `DRAFT` and `RECALLED` statuses for students. Downstream client ACL filtering in `ReferralContext` defensively excludes any unapproved drafts or withdrawn requests.
3. **Sensitive Clinical Notes Boundary**: SCID diagnostic scales and internal therapist clinical notes are withheld from students; overview surfaces basic triage indicators (`isFirstVisit`, `isMedicated`, `priorTherapy`) and referral reasons, while clinical feedback (`summary`, `followUp`) is only displayed once approved and finalized.
4. **Clickable Status Badge Routing (`getTargetTabForStatus`)**:
   - Status in `AWAITING_FEEDBACK_APPROVAL`, `CLOSED`, or when feedback is present $\rightarrow$ routes directly to `feedback` (`诊疗反馈`).
   - Status in progress (`AWAITING_APPROVAL`, `AWAITING_REVIEW`, `AWAITING_TRIAGE`, `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, `NEEDS_REASSIGNMENT`, `PENDING`) $\rightarrow$ routes directly to `tracker` (`转诊进度`).
   - Other / default $\rightarrow$ routes to `overview` (`转诊概览`).
5. **Ergonomic MD3 Header & Navigation Sync**:
   - Bottom navigation bar: Index 0 (`问卷测评`), Index 1 (`就医转诊`), Index 2 (`个人中心`).
   - Scroll sync: Scrolling down (> 35px) smoothly slides out page-level filter chips and animates segmented filter chips into the sticky top bar header (`ASSESSMENT_FILTER_ITEMS` on Tab 0, `REFERRAL_FILTER_ITEMS` on Tab 1). Scrolling back up restores the title and subtitle.

---

## Writable Files

The execution agent is strictly permitted to create or modify only the following paths:

### 1. New Source & Utility Files (`mobile/src/`)
- `mobile/src/utils/referralConstants.ts`
- `mobile/src/utils/referralRouting.ts`
- `mobile/src/utils/referralStatusEnricher.ts`
- `mobile/src/contexts/ReferralContext.tsx`
- `mobile/src/components/referrals/ReferralCard.tsx`
- `mobile/src/components/referrals/ReferralOverviewTab.tsx`
- `mobile/src/components/referrals/ReferralTrackerTab.tsx`
- `mobile/src/components/referrals/ReferralFeedbackTab.tsx`
- `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx`
- `mobile/src/pages/ReferralsPage.tsx`

### 2. New Test Files (`mobile/src/`)
- `mobile/src/api/intakeApi.test.ts`
- `mobile/src/utils/referralRouting.test.ts`
- `mobile/src/utils/referralStatusEnricher.test.ts`
- `mobile/src/contexts/ReferralContext.test.tsx`
- `mobile/src/components/referrals/ReferralCard.test.tsx`
- `mobile/src/components/referrals/ReferralDetailsFullScreen.test.tsx`
- `mobile/src/pages/ReferralsPage.test.tsx`

### 3. Existing Files to Modify (`mobile/src/`)
- `mobile/src/api/intakeApi.ts` (Extend with referral DTOs and API methods)
- `mobile/src/StudentApp.tsx` (Add `ReferralProvider`, 3-tab navigation bar, dynamic header sync for Tab 1, and `ReferralsPage` rendering)
- `mobile/src/StudentApp.test.tsx` (Update test assertions for 3-tab navigation, tab switching to 就医转诊, and dynamic header sync)
- `mobile/src/App.test.tsx` (Update navigation tabs count assertion from 2 to 3 and profileTab index from 1 to 2)

### 4. Planning Documentation
- `.plans/task.md`

---

## Test-Driven Development (TDD) Specifications

### Test Suite 1: API Client Referral Methods (`mobile/src/api/intakeApi.test.ts`)
- **Target**: `mobile/src/api/intakeApi.ts`
- **Test Cases**:
  1. `getReferrals invokes GET /api/referrals with Authorization header and parses list`: Mock `fetch`, assert request path `/api/referrals`, verify bearer token is attached, and assert returned array of `ReferralDto` items.
  2. `getReferralDetails invokes GET /api/referrals/{id}`: Call `getReferralDetails('ref-101')`, assert URL `/api/referrals/ref-101`, and assert returned `ReferralDetailsDto` matches payload.
  3. `getReferralTracking invokes GET /api/referrals/{id}/tracking`: Call `getReferralTracking('ref-101')`, assert URL `/api/referrals/ref-101/tracking`, and verify returned `ReferralTrackingDto` contains steps and destination.
  4. `throws descriptive Error when API returns HTTP 4xx/5xx`: Mock 403 Forbidden with `{ "error": "Access denied" }`, assert rejection with `Error('Access denied')`.

### Test Suite 2: Referral Routing & Enricher Logic (`mobile/src/utils/referralRouting.test.ts` & `referralStatusEnricher.test.ts`)
- **Target**: `mobile/src/utils/referralRouting.ts`, `mobile/src/utils/referralStatusEnricher.ts`
- **Test Cases in `referralRouting.test.ts`**:
  1. `getTargetTabForStatus routes CLOSED and AWAITING_FEEDBACK_APPROVAL to feedback tab`: Assert `getTargetTabForStatus('CLOSED') === 'feedback'`, `getTargetTabForStatus('AWAITING_FEEDBACK_APPROVAL') === 'feedback'`, and with `hasFeedback: true` returns `'feedback'`.
  2. `getTargetTabForStatus routes operational progress statuses to tracker tab`: For statuses `AWAITING_APPROVAL`, `AWAITING_REVIEW`, `AWAITING_TRIAGE`, `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, assert result is `'tracker'`.
  3. `getTargetTabForStatus falls back to overview tab for other statuses`: Assert `'DRAFT'`, `'RECALLED'`, or unknown status returns `'overview'`.
- **Test Cases in `referralStatusEnricher.test.ts`**:
  1. `enrichReferralStatus retains original status when steps are empty or null`: Pass referral with `status: 'AWAITING_TRIAGE'`, `steps: null`, assert `displayStatus === 'AWAITING_TRIAGE'`.
  2. `enrichReferralStatus overrides to REJECTED if any step has status ISSUE`: Step with `status: 'ISSUE'`, assert `displayStatus === 'REJECTED'`.
  3. `enrichReferralStatus maps ACTIVE step type to corresponding status`: Step with `type: 'SCHEDULING'`, `status: 'ACTIVE'`, assert `displayStatus === 'WAITING_FOR_SCHEDULING'`.
  4. `enrichReferralStatus marks status as WAITING_FOR_APPOINTMENT or PENDING when appointment time is reached`: Step `EVALUATION`, appointmentTime in past, verify enriched displayStatus.

### Test Suite 3: Referral Context & ACL State (`mobile/src/contexts/ReferralContext.test.tsx`)
- **Target**: `mobile/src/contexts/ReferralContext.tsx`
- **Test Cases**:
  1. `defensively filters out DRAFT and RECALLED referrals from state`: Provide mock list containing `['AWAITING_APPROVAL', 'DRAFT', 'CLOSED', 'RECALLED']`, verify `referrals` in context contains only non-draft/recalled items (count = 2).
  2. `computes totalCount, inProgressCount, and closedCount correctly`: For `['AWAITING_TRIAGE', 'WAITING_FOR_APPOINTMENT', 'CLOSED', 'REJECTED']`, assert `totalCount === 4`, `inProgressCount === 2`, `closedCount === 2`.
  3. `updates filter state between all, in_progress, and closed`: Verify `setFilter('in_progress')` updates `filter` value.
  4. `tracks isScrolled state for dynamic header synchronization`: Verify `setIsScrolled(true)` updates `isScrolled`.
  5. `refreshReferrals re-fetches from intakeApi and resets error`: Trigger refresh, assert `intakeApi.getReferrals` called.

### Test Suite 4: Referral Card Component (`mobile/src/components/referrals/ReferralCard.test.tsx`)
- **Target**: `mobile/src/components/referrals/ReferralCard.tsx`
- **Test Cases**:
  1. `renders status pill, risk chip, referral type label, title, and formatted date`: Assert text for `待排诊`, `高风险`, `初次转诊`, title, and date.
  2. `tapping card invokes onClick callback`: Simulate card click, assert `onClick` fired.
  3. `tapping status pill invokes onStatusClick and stops click propagation`: Simulate click on status badge, verify `onStatusClick` called with status and card `onClick` not triggered twice.

### Test Suite 5: Referrals Page Component (`mobile/src/pages/ReferralsPage.test.tsx`)
- **Target**: `mobile/src/pages/ReferralsPage.tsx`
- **Test Cases**:
  1. `renders loading spinner when loading is true`: Assert `<md-circular-progress>` present.
  2. `renders error alert with retry button on failure`: Assert error message and clicking retry calls `refreshReferrals`.
  3. `renders segmented filter chips (全部, 进行中, 已结案)`: Assert presence of all three filter options.
  4. `filters list correctly when toggling filter chips`: Click `进行中` $\rightarrow$ shows only in-progress cards; click `已结案` $\rightarrow$ shows only closed cards.
  5. `displays appropriate empty states when list is empty`:
     - Empty filter `all` $\rightarrow$ "暂无转诊记录"
     - Empty filter `in_progress` $\rightarrow$ "暂无进行中的转诊"
     - Empty filter `closed` $\rightarrow$ "暂无已结案转诊"
  6. `tapping a card opens ReferralDetailsFullScreen`: Click card, verify fullscreen modal renders.
  7. `tapping status pill on card opens ReferralDetailsFullScreen directly to target tab`: Click status pill on card in `CLOSED` status, verify fullscreen details opens with `activeTab === 'feedback'`.

### Test Suite 6: Fullscreen Details View & Tabs (`mobile/src/components/referrals/ReferralDetailsFullScreen.test.tsx`)
- **Target**: `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx`
- **Test Cases**:
  1. `renders top bar with back button, student name, clickable status badge, and risk pill`: Assert header elements. Clicking back button calls `onClose()`.
  2. `switching secondary tabs renders Overview, Tracker, and Feedback content`: Click tab buttons, verify corresponding tab component is mounted.
  3. `clicking header status badge routes to target tab`: In progress referral, clicking status badge switches active tab to `tracker`; with closed/feedback status, switches active tab to `feedback`.
  4. `ReferralOverviewTab renders 3 triage metrics, 3 severe risk indicators, and quote block`: Assert `是否初诊`, `是否服药`, `心理治疗`, `自杀意念`, `自杀企图`, `自残行为`, and full description quote.
  5. `ReferralTrackerTab renders 6 timeline steps, destination card, and appointment card`: Assert timeline steps with statuses (`COMPLETED`, `ACTIVE`, `PENDING`), hospital, department, doctor, and appointment time.
  6. `ReferralFeedbackTab renders doctor consultation summary and follow-up plan`: Assert doctor summary, follow-up plan, and doctor attachments.

### Test Suite 7: Student App Integration (`mobile/src/StudentApp.test.tsx`)
- **Target**: `mobile/src/StudentApp.tsx`
- **Test Cases**:
  1. `renders 3-destination bottom navigation bar with 问卷测评, 就医转诊, and 个人中心`: Assert 3 `<md-navigation-tab>` elements with correct labels and icons (`assignment`, `medical_services`, `account_circle`).
  2. `switches between 问卷测评, 就医转诊, and 个人中心 tabs`: Click tab 1, assert `ReferralsPage` renders; click tab 0, assert `AssessmentsPage` renders; click tab 2, assert `ProfilePage` renders.
  3. `synchronizes top bar headline dynamically based on active tab`:
     - On Tab 0: shows assessment title / task counts.
     - On Tab 1: shows "中南大学 · 医疗转诊" and referral headline ("就医转诊服务" or "还有 X 项转诊进行中").
  4. `scroll-triggered header filter displays REFERRAL_FILTER_ITEMS when scrolled on Tab 1`: When `isScrolled === true` on Tab 1, assert header displays segmented button with `全部`, `进行中`, `已结案`.

---

## Step-by-Step Implementation Roadmap

### Phase 1: API Client & DTO Contracts (Files: 2)
1. **Write failing unit tests for referral API methods**
   - File: `mobile/src/api/intakeApi.test.ts`
   - Action: Define test cases asserting `getReferrals`, `getReferralDetails`, `getReferralTracking` endpoints, Authorization header attachment, and error handling.
   - Verification: Run `npx vitest run src/api/intakeApi.test.ts` (fails: methods not defined).
2. **Extend intakeApi with referral DTOs & endpoints**
   - File: `mobile/src/api/intakeApi.ts`
   - Action: Export `ReferralType`, `ReferralStatus`, `RiskStatus`, `ReferredByDto`, `ReferralDto`, `ReferralStudentDemographicsDto`, `TriageInfoDto`, `RiskAssessmentDto`, `AttachmentDto`, `FeedbackDto`, `ReferralDetailsDto`, `DestinationDto`, `ReferralStepDto`, `ReferralTrackingDto`. Implement `intakeApi.getReferrals()`, `getReferralDetails(id)`, `getReferralTracking(id)`.
   - Verification: Run `npx vitest run src/api/intakeApi.test.ts` (passes green).

### Phase 2: Design Tokens, Utilities & Routing Logic (Files: 4)
3. **Define referral constants and MD3 design tokens**
   - File: `mobile/src/utils/referralConstants.ts`
   - Action: Export `STATUS_LABELS`, `STATUS_STYLES`, `RISK_LEVEL_LABELS`, `RISK_LEVEL_STYLES`, `REFERRAL_TYPE_LABELS`, step icons and timeline labels.
4. **Write failing tests for referral routing & enricher**
   - Files: `mobile/src/utils/referralRouting.test.ts`, `mobile/src/utils/referralStatusEnricher.test.ts`
   - Action: Define tests for status-based tab routing (`getTargetTabForStatus`) and status enrichment (`enrichReferralStatus`).
   - Verification: Run vitest (fails).
5. **Implement referral routing & enricher**
   - Files: `mobile/src/utils/referralRouting.ts`, `mobile/src/utils/referralStatusEnricher.ts`
   - Action: Implement `getTargetTabForStatus` routing rules and `enrichReferralStatus` step derivation logic.
   - Verification: Run vitest (passes green).

### Phase 3: Global State & ACL Context (Files: 2)
6. **Write failing tests for ReferralContext**
   - File: `mobile/src/contexts/ReferralContext.test.tsx`
   - Action: Define tests for fetching, defensive filtering of `DRAFT` and `RECALLED`, status counters (`totalCount`, `inProgressCount`, `closedCount`), filter switching, and scroll tracking.
   - Verification: Run vitest (fails).
7. **Implement ReferralContext and Provider**
   - File: `mobile/src/contexts/ReferralContext.tsx`
   - Action: Create `ReferralContext`, `ReferralProvider`, and `useReferrals` hook. Integrate with `intakeApi.getReferrals()`, enforce defensive ACL filtering, compute metrics, and manage scroll/filter state.
   - Verification: Run `npx vitest run src/contexts/ReferralContext.test.tsx` (passes green).

### Phase 4: Referral Card & Tab Components (Files: 8)
8. **Write failing tests for ReferralCard**
   - File: `mobile/src/components/referrals/ReferralCard.test.tsx`
   - Action: Test rendering of status pill, risk chip, type label, title, initiator, date, and click propagation.
   - Verification: Run vitest (fails).
9. **Implement ReferralCard component**
   - File: `mobile/src/components/referrals/ReferralCard.tsx`
   - Action: Build elevated MD3 card adhering to design tokens, with clickable status badge and chevron right drilldown affordance.
   - Verification: Run `ReferralCard.test.tsx` (passes green).
10. **Implement Tab Components**
    - `mobile/src/components/referrals/ReferralOverviewTab.tsx`: 3-column triage metrics, 3-column severe risk grid, full description quote block, attachments.
    - `mobile/src/components/referrals/ReferralTrackerTab.tsx`: 6-step timeline tracker with icons/states, active route destination card, and appointment card.
    - `mobile/src/components/referrals/ReferralFeedbackTab.tsx`: Doctor clinical summary, follow-up plan card, doctor attachments.
11. **Write failing tests for ReferralDetailsFullScreen**
    - File: `mobile/src/components/referrals/ReferralDetailsFullScreen.test.tsx`
    - Action: Test full modal rendering, back navigation, tab switching, clickable header status pill routing, and tab content hydration.
    - Verification: Run vitest (fails).
12. **Implement ReferralDetailsFullScreen**
    - File: `mobile/src/components/referrals/ReferralDetailsFullScreen.tsx`
    - Action: Build fullscreen modal takeover with sticky top bar, clickable status pill, secondary tabs (`转诊概览`, `转诊进度`, `诊疗反馈`), query fetching for details and tracking, and status enrichment.
    - Verification: Run `ReferralDetailsFullScreen.test.tsx` (passes green).

### Phase 5: Referrals Page & Root Tab Integration (Files: 2)
13. **Write failing tests for ReferralsPage**
    - File: `mobile/src/pages/ReferralsPage.test.tsx`
    - Action: Test segmented filter chips, card list rendering, loading and error states, empty states, and card/status pill click interactions.
    - Verification: Run vitest (fails).
14. **Implement ReferralsPage**
    - File: `mobile/src/pages/ReferralsPage.tsx`
    - Action: Build root page consuming `ReferralContext`, rendering segmented filter (`全部`, `进行中`, `已结案`), card list, empty states, and fullscreen modal trigger.
    - Verification: Run `ReferralsPage.test.tsx` (passes green).

### Phase 6: StudentApp Dynamic Navigation & Header Sync (Files: 2)
15. **Update StudentApp.test.tsx with failing integration tests**
    - File: `mobile/src/StudentApp.test.tsx`
    - Action: Add test cases verifying 3 bottom navigation tabs, switching to Tab 1 (`就医转诊`), header headline synchronization for referrals, and scroll-triggered `REFERRAL_FILTER_ITEMS` header filter.
    - Verification: Run vitest (fails).
16. **Update StudentApp.tsx**
    - File: `mobile/src/StudentApp.tsx`
    - Action:
      - Wrap content in `ReferralProvider`.
      - Expand `<md-navigation-bar>` to 3 tabs: 0 (`问卷测评`, `assignment`), 1 (`就医转诊`, `medical_services`), 2 (`个人中心`, `account_circle`).
      - In main body: render `ReferralsPage` when `activeTab === 1`.
      - Add scroll listener handler for `activeTab === 1` that updates `ReferralContext.setIsScrolled`.
      - In top header: conditionally animate segmented filter when scrolled (`ASSESSMENT_FILTER_ITEMS` on Tab 0, `REFERRAL_FILTER_ITEMS` on Tab 1), and dynamic headline when not scrolled.
    - Verification: Run `StudentApp.test.tsx` (passes green).

---

## Acceptance Criteria & Verification Gates

### Quality Gates
- [ ] `cd mobile && npm run lint` (`tsc --noEmit`) passes with zero type errors.
- [ ] `cd mobile && npm run test` passes 100% of unit, component, and integration tests across all suites:
  - `src/api/intakeApi.test.ts`
  - `src/utils/referralRouting.test.ts`
  - `src/utils/referralStatusEnricher.test.ts`
  - `src/contexts/ReferralContext.test.tsx`
  - `src/components/referrals/ReferralCard.test.tsx`
  - `src/components/referrals/ReferralDetailsFullScreen.test.tsx`
  - `src/pages/ReferralsPage.test.tsx`
  - `src/StudentApp.test.tsx`
- [ ] `cd mobile && npm run build` completes cleanly without bundling errors or missing dependencies.
- [ ] Read-only bounded context invariant verified: no student mutation buttons or draft exposures.
