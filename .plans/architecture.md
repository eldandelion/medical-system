# Architecture & Technical Design: Mobile Intake Referrals Tab ("就医转诊")

## 1. Context & Architectural Goals
- **Target Branch**: `feat/mobile-referrals-tab`
- **Application Target**: Mobile Intake Single Page Application (`mobile/`)
- **System Goal**: Extend the mobile student intake portal by introducing a dedicated bottom navigation tab for **就医转诊 (Referrals)**, real-time status filtering with scroll-triggered header sync, and an MD3-compliant **Fullscreen Referral Details View** mirroring the desktop clinical review features while respecting mobile-first ergonomic constraints and `GEMINI.md` architecture invariants.

---

## 2. Bounded Context & Domain Alignment

### 2.1 Domain Invariants (Upstream Backend to Downstream Mobile)
1. **Read-Only Student Access**:
   - In `ReferralActionPolicy.kt`, `getActionableStatusesFor(UserRole.STUDENT)` strictly evaluates to `emptyList()`.
   - In `Referral.kt`, `getAllowedActions(user)` returns no actions for `UserRole.STUDENT`. The emitted `ReferralDto.availableActions` is therefore always `[]`.
   - The mobile bounded view is strictly a **Read-Only Projection**.
2. **Double-Sided Exclusion of Drafts & Recalled Referrals**:
   - Upstream SQL predicates (`ReferralVisibilityPolicy.kt`) filter out `DRAFT` and `RECALLED` statuses for students.
   - Downstream ACL defensive filter ensures unapproved drafts or withdrawn requests are never exposed to students.
3. **Sensitive Clinical Notes Boundary**:
   - Internal psychiatric SCID diagnostic scales and clinical notes are omitted from the student view.
   - Overview exposes basic triage status (`isFirstVisit`, `isMedicated`, `priorTherapy`) and referral reason.
   - Doctor's consultation feedback (`summary`, `followUp`) is only surfaced once submitted and approved.

---

## 3. System Boundaries & Component Tree

```text
mobile/src/
├── api/
│   └── intakeApi.ts                      # Extended with ReferralDto, Details, Tracking & endpoints
├── contexts/
│   └── ReferralContext.tsx               # Global referral state, filter ('all'|'in_progress'|'closed'), counts, and scroll tracking
├── utils/
│   ├── referralConstants.ts              # Localized labels, status colors, and MD3 semantic design tokens
│   ├── referralRouting.ts                # getTargetTabForStatus logic for status pill navigation
│   └── referralStatusEnricher.ts         # enrichReferralStatus engine for desktop presentation parity
├── components/
│   └── referrals/
│       ├── ReferralCard.tsx              # Elevated MD3 card showing status pill, type, title, date, and initiator
│       ├── ReferralDetailsFullScreen.tsx # Fullscreen modal takeover with header pill, back navigation, and tabs
│       ├── ReferralOverviewTab.tsx       # Triage metrics, severe risk indicators, description quote, attachments
│       ├── ReferralTrackerTab.tsx        # 6-step timeline tracker, destination card, and appointment card
│       └── ReferralFeedbackTab.tsx       # Doctor's clinical summary, diagnosis, follow-up plan & attachments
├── pages/
│   ├── ReferralsPage.tsx                 # Tab 1 root page (segmented filter + card list + empty states)
│   └── ReferralsPage.test.tsx            # Unit tests for filter & card interactions
└── StudentApp.tsx                        # 3-destination navigation bar & scroll-triggered dynamic header sync
```

---

## 4. API Contracts & TypeScript Interfaces

### 4.1 Data Models (`mobile/src/api/intakeApi.ts`)
```typescript
export type ReferralType = 'INITIAL' | 'FOLLOW_UP' | 'EMERGENCY';

export type ReferralStatus =
  | 'DRAFT'
  | 'AWAITING_APPROVAL'
  | 'AWAITING_REVIEW'
  | 'AWAITING_TRIAGE'
  | 'WAITING_FOR_SCHEDULING'
  | 'WAITING_FOR_APPOINTMENT'
  | 'AWAITING_FEEDBACK_APPROVAL'
  | 'NEEDS_REASSIGNMENT'
  | 'REJECTED'
  | 'RECALLED'
  | 'CLOSED'
  | 'ERROR';

export type RiskStatus = 'HIGH' | 'MEDIUM' | 'LOW';

export interface ReferredByDto {
  name: string;
}

export interface ReferralDto {
  id: string;
  studentId: number;
  studentName: string;
  studentNumber: string;
  type: ReferralType;
  date: string; // ISO-8601 LocalDateTime string
  title: string;
  description: string;
  riskLevel: RiskStatus;
  status: ReferralStatus;
  referredBy: ReferredByDto;
  availableActions: string[];
}

export interface StudentDemographicsDto {
  studentId: string;
  school: string;
  grade: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
}

export interface TriageInfoDto {
  isFirstVisit: boolean;
  isMedicated: boolean;
  priorTherapy: string;
  scidDiagnosis?: string | null;
  fullDescription: string;
}

export interface RiskAssessmentDto {
  ideation: boolean;
  attempt: boolean;
  selfHarm: boolean;
  notes?: string | null;
}

export interface AttachmentDto {
  name: string;
  size: string;
  fileId?: number | null;
}

export interface FeedbackDto {
  summary: string;
  followUp: string;
  attachments: AttachmentDto[];
}

export interface ReferralDetailsDto {
  baseInfo: ReferralDto;
  studentDemographics: StudentDemographicsDto;
  triageInfo: TriageInfoDto;
  riskAssessment: RiskAssessmentDto;
  feedback?: FeedbackDto | null;
  attachments: AttachmentDto[];
}

export interface DestinationDto {
  hospital: string;
  department: string;
  doctor: string;
  admin: string;
  transferDate?: string | null;
  appointmentTime?: string | null;
}

export interface ReferralStepDto {
  id: string;
  type: string; // INITIATION, REVIEW, TRIAGE, SCHEDULING, EVALUATION, FEEDBACK
  time: string;
  status: string; // COMPLETED, ACTIVE, PENDING, ISSUE
  reason?: string | null;
}

export interface ReferralTrackingDto {
  destination?: DestinationDto | null;
  steps?: ReferralStepDto[] | null;
}
```

### 4.2 API Client Extension
```typescript
export const intakeApi = {
  // Existing Auth & Scales endpoints...
  getReferrals: () => request<ReferralDto[]>('/api/referrals'),
  getReferralDetails: (id: string | number) => request<ReferralDetailsDto>(`/api/referrals/${id}`),
  getReferralTracking: (id: string | number) => request<ReferralTrackingDto>(`/api/referrals/${id}/tracking`),
};
```

---

## 5. Status Pill & Navigation Rules

### 5.1 Clickable Status Badge Routing (`getTargetTabForStatus`)
- When status is `AWAITING_FEEDBACK_APPROVAL` or `CLOSED` (or `feedback != null`): navigates to `feedback` (`诊疗反馈`).
- When status is in operational progress (`AWAITING_APPROVAL`, `AWAITING_TRIAGE`, `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, etc.): navigates to `tracker` (`转诊进度`).
- Default: navigates to `overview` (`转诊概览`).

### 5.2 Header & Navigation Bar in `StudentApp.tsx`
- **Bottom Navigation Bar**:
  - Index 0: `问卷测评` (icon: `assignment`)
  - Index 1: `就医转诊` (icon: `medical_services`)
  - Index 2: `个人中心` (icon: `account_circle`)
- **Scroll-Triggered Segmented Filters in Header**:
  - On Tab 0: shows `ASSESSMENT_FILTER_ITEMS` (`全部`, `待填报`, `已完成`).
  - On Tab 1: shows `REFERRAL_FILTER_ITEMS` (`全部`, `进行中`, `已结案`).
  - Smooth animation sliding into top bar header on scroll down, sliding title back on scroll to top.
