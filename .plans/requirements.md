# Requirements (Human Intent Lock) — Remove 高危名单, notification-driven high-risk workflow

## Goal
Remove the 高危名单 (High-Risk Roster) page. High-risk handling is notification-driven:
system evaluates assessment → teacher & head counsellor receive a notification → action buttons
let them immediately create a referral or open the student profile in 学生管理.

## Locked decisions
1. **Teacher alert**: Add new `NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER` sent to the
   student's assigned teacher (`student.assignedTeacherId`) when ClinicalRiskEvaluator evaluates HIGH.
   Existing `ASSESSMENT_HIGH_RISK_ALERT_HC` to head counsellors stays.
2. **Remove auto-referral**: `StudentHealthProfileRiskListener` must no longer auto-create a referral on HIGH.
3. **Single alert source**: Only `ClinicalRiskEvaluator` emits high-risk alerts. Drop the ">80% of max score"
   HC alert in `AssessmentEventListener` (keep the ASSESSMENT_COMPLETED_TEACHER notification).
4. **Action buttons** (both teacher & HC high-risk notifications):
   - `发起转诊` → opens the referral creation form pre-filled (studentId, title, riskLevel, severeRiskFactors from flags).
   - `查看学生` → opens the student's profile in 学生管理.
5. **Duplicate guard**: `发起转诊` hidden once the student has an open (non-terminal) referral. Backend computes
   the flag; UI only reads it.
6. **Full removal** of 高危名单: `HighRiskListView`, nav items/tabs in HeadCouncillorPage & TeacherPage,
   `frontend/src/api/highRisk.ts`, backend `GET /api/students/high-risk`, `StudentService.fetchHighRiskStudents`,
   `HighRiskStudentDto`, related tests and MSW mocks/handlers.
7. **Dashboard activity** items that jumped to the HIGH_RISK tab now go to the 通知 (Notifications) page.

## Out of scope
- Mobile app (medical-system-mobile).
- MEDIUM-risk notifications (HIGH only).

## Constraints (from GEMINI.md)
- Backend language-agnostic: no presentation strings in DTOs; use enums/booleans/IDs.
- MD3 web components only for inputs.
- Strict TS types mirroring Kotlin DTOs; MSW mocks match backend payloads.
- Enums persisted via 1-based ordinal converters — append new enum entries at the end with next ordinal.
