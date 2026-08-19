# Feature: Dynamic Stage-Aware Status Card in Referral Details Overview

The following plan is complete and actionable. Validate documentation, codebase patterns, and task sanity before implementing. Pay special attention to existing component props, Lucide icon consistency with `ReferralTracker`, and TypeScript type contracts.

---

## Feature Description

In the University Medical Screening System's Referral Management module, the **Referral Details View** (`ReferralDetailsView.tsx`) displays an overview of an individual student's referral. At the top of the **转诊概览** (Overview) tab, a prominent status banner card ([`ReferralStatusCard.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralStatusCard.tsx)) is rendered.

Currently, this card displays a static placeholder label ("转诊处理中") rather than communicating the actual lifecycle stage or pending workflow action. This update makes the status card **dynamic and stage-aware**:
1. It displays the **exact pending workflow stage** based on the referral's domain status (`AWAITING_APPROVAL` / `AWAITING_REVIEW`, `AWAITING_TRIAGE`, `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, `AWAITING_FEEDBACK_APPROVAL`, `CLOSED`, `REJECTED`, `RECALLED`, `DRAFT`).
2. It uses the **exact same icons** configured for steps in the **转诊进度** tracking tab ([`ReferralTracker.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralTracker.tsx)):
   - `REVIEW` / `AWAITING_APPROVAL`: `Users`
   - `TRIAGE` / `AWAITING_TRIAGE`: `Building2`
   - `SCHEDULING` / `WAITING_FOR_SCHEDULING`: `Calendar`
   - `EVALUATION` / `WAITING_FOR_APPOINTMENT`: `Stethoscope`
   - `FEEDBACK` / `AWAITING_FEEDBACK_APPROVAL`: `MessageSquare`
   - `CLOSED`: `Check`
   - `REJECTED`: `X`
   - `RECALLED`: `RotateCcw`
3. It retains interactive navigation: clicking the card immediately navigates to the **转诊进度** (Tracker) tab.

---

## User Story

```
As a Teacher, Head Councillor, Trial Admin, or Doctor
I want the top status banner in the Referral Overview tab to clearly show the exact current workflow step and corresponding icon
So that I can immediately know who the referral is waiting on and what action is required without having to switch tabs.
```

---

## Problem Statement

When users open a referral details view, the top card in the overview tab currently displays generic "转诊处理中" text because `activeStep` was passed as `null` and the component only checked `activeStep.type`. Users have to switch to the **转诊进度** tab to see whether the referral is awaiting approval, triage, scheduling, appointment evaluation, or feedback approval.

---

## Solution Statement

1. **Extend `ReferralStatusCardProps`**: Update [`ReferralStatusCard.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralStatusCard.tsx) to accept `status?: string` (the referral status/displayStatus) in addition to optional `activeStep?: ReferralStep`.
2. **Unified Status & Step Resolution**: Define a robust resolution helper that maps domain `ReferralStatus` strings (and `ReferralStepType`) to:
   - Specific localized stage title (e.g. `AWAITING_APPROVAL` -> "辅导员审批中", `AWAITING_TRIAGE` -> "中心分诊中", `WAITING_FOR_SCHEDULING` -> "预约排期中", `WAITING_FOR_APPOINTMENT` -> "等待就诊", `AWAITING_FEEDBACK_APPROVAL` -> "诊疗反馈审批中", `CLOSED` -> "转诊已结案", `REJECTED` -> "转诊已拒绝", `RECALLED` -> "转诊已撤回").
   - Synchronized Lucide React step icon (`Users`, `Building2`, `Calendar`, `Stethoscope`, `MessageSquare`, `Check`, `X`, `RotateCcw`).
   - Material 3 container color styles (`primary-container` for active in-progress stages, `error-container` for rejected, `surface-container-high` for closed/recalled).
3. **Connect Overview Tab**: Pass `status={displayStatus || referral.status}` from [`ReferralOverviewTab.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralOverviewTab.tsx) to `<ReferralStatusCard />`.
4. **Comprehensive Unit Testing**: Create unit tests in `ReferralStatusCard.test.tsx` and extend `ReferralOverviewTab.test.tsx` verifying every workflow status and icon rendering.

---

## Feature Metadata

- **Feature Type**: Enhancement / UI Architecture Refinement
- **Estimated Complexity**: Low (Frontend Component Presentation & Mapping)
- **Primary Systems Affected**: Frontend Referral Module ([`ReferralStatusCard.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralStatusCard.tsx), [`ReferralOverviewTab.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralOverviewTab.tsx))
- **Dependencies**: React 19, Lucide React (`Users`, `Building2`, `Calendar`, `Stethoscope`, `MessageSquare`, `Check`, `X`, `RotateCcw`)

---

## CONTEXT REFERENCES

### Relevant Codebase Files (MUST READ BEFORE IMPLEMENTING)

- [`frontend/src/components/records/ReferralStatusCard.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralStatusCard.tsx#L1-L67) (lines 1–67) — Current status card component implementation.
- [`frontend/src/components/records/ReferralOverviewTab.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralOverviewTab.tsx#L20-L45) (lines 20–45) — Overview tab hosting `ReferralStatusCard` and providing `onNavigateToTracker`.
- [`frontend/src/components/records/ReferralTracker.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralTracker.tsx#L40-L75) (lines 40–75) — Definitive source of step icons (`getIconForType`) and step titles.
- [`frontend/src/utils/referralUtils.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/utils/referralUtils.ts#L1-L44) (lines 1–44) — Status enrichment and active step mapping (`ACTIVE_STEP_STATUS_MAP`).
- [`frontend/src/config/styleConstants.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/config/styleConstants.ts#L13-L47) (lines 13–47) — `STATUS_STYLES` and `STATUS_LABELS`.
- [`backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt) — Backend domain enum definitions for referral lifecycle statuses.

### New Files to Create

- `frontend/src/components/records/ReferralStatusCard.test.tsx` — Unit test suite for status titles, icons, visual themes, and tracker navigation callbacks across all domain referral statuses.

---

## Patterns to Follow

### 1. Step Icons Synchronization Pattern
From [`ReferralTracker.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralTracker.tsx#L40-L57):
```tsx
import { Users, Building2, Calendar, Stethoscope, MessageSquare, Check, X, RotateCcw } from 'lucide-react';

export const getIconForType = (type: ReferralStepType) => {
  switch (type) {
    case 'INITIATION':
      return GraduationCap;
    case 'REVIEW':
      return Users;
    case 'TRIAGE':
      return Building2;
    case 'SCHEDULING':
      return Calendar;
    case 'EVALUATION':
      return Stethoscope;
    case 'FEEDBACK':
      return MessageSquare;
    default:
      return null;
  }
};
```

### 2. Status Label Resolution Map
```tsx
export const REFERRAL_STAGE_CONFIG: Record<string, { label: string; icon: React.ComponentType<any>; style: 'active' | 'completed' | 'error' | 'neutral' }> = {
  AWAITING_APPROVAL: { label: '辅导员审批中', icon: Users, style: 'active' },
  AWAITING_REVIEW: { label: '辅导员审批中', icon: Users, style: 'active' },
  AWAITING_TRIAGE: { label: '中心分诊中', icon: Building2, style: 'active' },
  WAITING_FOR_SCHEDULING: { label: '预约排期中', icon: Calendar, style: 'active' },
  WAITING_FOR_APPOINTMENT: { label: '等待就诊', icon: Stethoscope, style: 'active' },
  AWAITING_FEEDBACK_APPROVAL: { label: '诊疗反馈审批中', icon: MessageSquare, style: 'active' },
  CLOSED: { label: '转诊已结案', icon: Check, style: 'completed' },
  REJECTED: { label: '转诊已拒绝', icon: X, style: 'error' },
  RECALLED: { label: '转诊已撤回', icon: RotateCcw, style: 'neutral' },
  DRAFT: { label: '草稿待提交', icon: GraduationCap, style: 'neutral' },
};
```

---

## IMPLEMENTATION PLAN

### Phase 1: Core Component Refactoring

**Tasks:**
- Refactor [`ReferralStatusCard.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralStatusCard.tsx) to accept `status?: string` and `activeStep?: ReferralStep`.
- Configure comprehensive status-to-stage dictionary mapping domain statuses and step types to their precise Chinese display title, matching Lucide icon, and M3 container styling tokens.

### Phase 2: Integration with Overview Tab

**Tasks:**
- Update [`ReferralOverviewTab.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralOverviewTab.tsx) to pass `status={displayStatus || referral.status}` to `ReferralStatusCard`.
- Verify card continues to trigger `onNavigateToTracker` when clicked.

### Phase 3: Unit Testing & Verification

**Tasks:**
- Create `frontend/src/components/records/ReferralStatusCard.test.tsx` testing every state branch.
- Update `frontend/src/components/records/ReferralOverviewTab.test.tsx` to assert exact stage name rendering.
- Run `npm run lint` and `vitest` suite to verify zero regressions.

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

### Task 1: UPDATE `frontend/src/components/records/ReferralStatusCard.tsx`

- **IMPLEMENT**:
  1. Add `status?: string` to `ReferralStatusCardProps`.
  2. Map domain statuses (`AWAITING_APPROVAL`, `AWAITING_TRIAGE`, `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, `AWAITING_FEEDBACK_APPROVAL`, `CLOSED`, `REJECTED`, `RECALLED`) and step types (`REVIEW`, `TRIAGE`, `SCHEDULING`, `EVALUATION`, `FEEDBACK`) to specific Chinese labels and icons (`Users`, `Building2`, `Calendar`, `Stethoscope`, `MessageSquare`, `Check`, `X`, `RotateCcw`).
  3. Style container, icon background, and text according to status category:
     - `error`: `bg-[var(--md-sys-color-error-container)]/20 text-[var(--md-sys-color-on-error-container)]`
     - `completed`: `bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)]`
     - `neutral`: `bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]`
     - `active`: `bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]`
  4. Ensure `chevron_right` navigation indicator and `onClick` interaction remain intact.
- **PATTERN**: [`ReferralTracker.tsx:40-75`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralTracker.tsx#L40-L75)
- **IMPORTS**: `import { Users, Building2, Calendar, Stethoscope, MessageSquare, Check, X, RotateCcw, GraduationCap } from 'lucide-react';`
- **VALIDATE**: `npm --prefix frontend run lint`

### Task 2: UPDATE `frontend/src/components/records/ReferralOverviewTab.tsx`

- **IMPLEMENT**:
  1. Pass `status={displayStatus || referral.status}` to `<ReferralStatusCard />`.
  2. Keep `onClick={onNavigateToTracker}` for quick navigation to the Tracker tab.
- **PATTERN**: [`ReferralOverviewTab.tsx:35-40`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralOverviewTab.tsx#L35-L40)
- **VALIDATE**: `npm --prefix frontend run lint`

### Task 3: CREATE `frontend/src/components/records/ReferralStatusCard.test.tsx`

- **IMPLEMENT**:
  1. Test rendering each active status:
     - `AWAITING_APPROVAL` -> renders "辅导员审批中"
     - `AWAITING_TRIAGE` -> renders "中心分诊中"
     - `WAITING_FOR_SCHEDULING` -> renders "预约排期中"
     - `WAITING_FOR_APPOINTMENT` -> renders "等待就诊"
     - `AWAITING_FEEDBACK_APPROVAL` -> renders "诊疗反馈审批中"
  2. Test rendering terminal statuses:
     - `CLOSED` -> renders "转诊已结案"
     - `REJECTED` -> renders "转诊已拒绝"
     - `RECALLED` -> renders "转诊已撤回"
  3. Test fallback to `activeStep` if `status` is not provided.
  4. Test clicking the card triggers `onClick`.
- **PATTERN**: [`ReferralActionFooter.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/ReferralActionFooter.test.tsx)
- **VALIDATE**: `npx --prefix frontend vitest run --pool=threads src/components/records/ReferralStatusCard.test.tsx`

### Task 4: UPDATE `frontend/src/components/records/ReferralOverviewTab.test.tsx`

- **IMPLEMENT**:
  - Add assertion verifying that when `ReferralOverviewTab` renders a referral with `status: 'AWAITING_TRIAGE'`, "中心分诊中" is displayed in the DOM.
- **VALIDATE**: `npx --prefix frontend vitest run --pool=threads src/components/records/ReferralOverviewTab.test.tsx`

---

## TESTING STRATEGY

### Unit Tests
- `ReferralStatusCard.test.tsx`:
  - Verify exact text for all domain `ReferralStatus` values.
  - Verify icon component instantiation for all step types.
  - Verify `onClick` callback execution.
- `ReferralOverviewTab.test.tsx`:
  - Integration assertion ensuring status card accurately receives and reflects the parent referral's current lifecycle state.

### Edge Cases
- Unknown or unrecognized status string: Gracefully falls back to formatted label or "转诊处理中".
- Explicit `activeStep` supplied without `status`: Uses `activeStep.type` mapping.
- Both `status` and `activeStep` provided: Prioritizes active step type if dynamic, else resolves from status.
- DRAFT status: Header card is hidden in Overview tab (matching existing `referral.status !== 'DRAFT'` guard).

---

## VALIDATION COMMANDS

### Level 1: Syntax & Linting
```bash
npm --prefix frontend run lint
```

### Level 2: Component Unit Tests
```bash
npx --prefix frontend vitest run --pool=threads src/components/records/ReferralStatusCard.test.tsx
```

### Level 3: Integration Tests
```bash
npx --prefix frontend vitest run --pool=threads src/components/records/ReferralOverviewTab.test.tsx
```

### Level 4: Full Test Suite
```bash
npx --prefix frontend vitest run --pool=threads
```

---

## ACCEPTANCE CRITERIA

- [ ] `ReferralStatusCard` dynamically displays the exact stage/pending action rather than static placeholder text.
- [ ] Icons on `ReferralStatusCard` match the exact step icons from `ReferralTracker` (`Users`, `Building2`, `Calendar`, `Stethoscope`, `MessageSquare`, `Check`, `X`, `RotateCcw`).
- [ ] Clicking the status card continues to navigate to the "转诊进度" (Tracker) tab.
- [ ] All new and existing unit tests pass with zero regressions.
- [ ] TypeScript strict mode checks (`tsc --noEmit`) pass with zero errors.

---

## COMPLETION CHECKLIST

- [ ] All tasks completed in order
- [ ] Each task validation passed immediately
- [ ] Full test suite passes
- [ ] No linting or type checking errors
- [ ] Acceptance criteria all met

---

## NOTES

- The backend is strictly language-agnostic. All localized labels are owned by the frontend configuration in `ReferralStatusCard.tsx`.
- The icons are imported from `lucide-react`, matching the exact visual identity established in `ReferralTracker.tsx`.
