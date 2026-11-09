# Architecture: Remove 高危名单 — Notification-Driven High-Risk Workflow

Source requirements: [requirements.md](./requirements.md). Synthesized from the architect design + DDD consultation, with code-verified corrections.

## 1. Summary
- `ClinicalRiskEvaluator` is the **single source** of high-risk alerts. On HIGH it notifies all head counsellors (`ASSESSMENT_HIGH_RISK_ALERT_HC`) and the student's assigned teacher (new `ASSESSMENT_HIGH_RISK_ALERT_TEACHER`).
- Both alerts use `actionType = VIEW_STUDENT` (new), `actionTargetId = studentId`, and identical payloads.
- `NotificationDto.canCreateReferral: Boolean?` is **computed at read time** (null for non-high-risk codes; for high-risk codes `true` iff the student has no open referral). Never stored.
- Frontend high-risk notifications show `发起转诊` (when `canCreateReferral !== false`) and `查看学生`.
- Auto-referral on HIGH and the ">80%" HC alert are removed. 高危名单 is removed end to end.

## 2. Bounded-context decision
Keep the direct notification send in `ClinicalRiskEvaluator` (minimal diff). Do **not** fan out from `StudentRiskStatusChangedEvent`: it is also published by `StudentProfileController` for manual risk edits, which would violate "only the evaluator emits alerts". The evaluator keeps publishing that event (the listener just ignores HIGH now); fix the stale comment.

## 3. Contracts

### Enums (stored via explicit `code` converters — `NotificationMessageCodeConverter`, `NotificationActionTypeConverter`)
- `NotificationMessageCode`: append `ASSESSMENT_HIGH_RISK_ALERT_TEACHER(34)`. Never rename/remove existing entries (unknown DB codes break `GET /api/notifications`).
- `NotificationActionType`: append `VIEW_STUDENT(11)` (the frontend already has a `VIEW_STUDENT` branch rendering `查看学生`).

### Open-referral definition (single source of truth)
- `ReferralStatus.companion.TERMINAL_STATUSES = setOf(REJECTED, CLOSED, ERROR)` + `val isTerminal`.
- Open = not terminal (includes DRAFT and RECALLED — RECALLED can return to AWAITING_APPROVAL). Matches the current `TERMINAL_REFERRAL_STATUSES` in `StudentHealthProfileRiskListener`, which moves into `ReferralStatus`.
- Repository: `ReferralRepository.findStudentIdsWithOpenReferral(studentIds: Collection<Long>): Set<Long>` (adapter → JPA derived query `findByStudentIdInAndStatusNotIn` or a JPQL `select distinct r.student.id`). Batched — one query per notification list read. Verify the actual student property path on `ReferralEntity`.

### NotificationDto (Kotlin) / TS mirror
```kotlin
val canCreateReferral: Boolean? = null   // appended field
```
```ts
canCreateReferral?: boolean | null;
```
Computed in the notification read path (prefer `NotificationService`, so the controller doesn't depend on Referral). Only for messageCodes `ASSESSMENT_HIGH_RISK_ALERT_HC` / `ASSESSMENT_HIGH_RISK_ALERT_TEACHER`, keyed on `actionTargetId` (studentId).

### High-risk alert payload (both codes, identical)
`studentId, studentNumber, studentName, riskStatus, riskFlags (List<String>), crisisFlags, level="HIGH", scaleCode, screeningReasons`.

## 4. Backend changes
| File | Change |
|---|---|
| `model/NotificationMessageCode.kt` | append `ASSESSMENT_HIGH_RISK_ALERT_TEACHER(34)` |
| `model/NotificationActionType.kt` | append `VIEW_STUDENT(11)` |
| `model/ReferralStatus.kt` | `TERMINAL_STATUSES`, `isTerminal` |
| `repository/ReferralRepository.kt` (+ adapter, JPA repo) | `findStudentIdsWithOpenReferral` |
| `dto/NotificationDto.kt` | `canCreateReferral: Boolean? = null` |
| `service/NotificationService.kt` / `controller/NotificationController.kt` | compute `canCreateReferral` batched at read |
| `service/ClinicalRiskEvaluator.kt` | HC alert → `VIEW_STUDENT`; add teacher alert to `student?.assignedTeacher?.userId` (skip if null, own try/catch); log ERROR if no recipient at all; fix stale comment |
| `event/StudentHealthProfileRiskListener.kt` | remove `onStudentRiskStatusChanged`, `createAutoReferral`, `AUTO_REFERRAL_TITLE`, local terminal set, unused deps (`userRepository`, `referralService`); keep `onReferralInitiated`, `onStudentRegistered` |
| `event/AssessmentEventListener.kt` | remove >80% HC alert + `headCounsellorRepository`; keep `ASSESSMENT_COMPLETED_TEACHER`, drop heuristic `isHighRisk`/`level` payload keys |
| `controller/StudentController.kt` | remove `GET /api/students/high-risk` |
| `service/StudentService.kt` | remove `fetchHighRiskStudents` (verify no other callers) |
| `dto/HighRiskStudentDto.kt` | delete |

## 5. Frontend changes
| File | Change |
|---|---|
| `api/notifications.ts` | `canCreateReferral?: boolean \| null` |
| `components/notifications/NotificationsView.tsx` | text/title/icon for `ASSESSMENT_HIGH_RISK_ALERT_TEACHER` (reuse HC renderer); for both high-risk codes: `发起转诊` (hidden when `canCreateReferral === false`) opens pre-filled `ReferralCreationForm` via the creation overlay (same mechanism HighRiskListView used: studentId, title `高风险筛查转诊 - {name} ({number})`, riskLevel from `payload.riskStatus`, severeRiskFactors = payload.riskFlags ∩ {SUICIDAL_IDEATION, SUICIDE_ATTEMPT, SELF_HARM}); `查看学生` via existing `VIEW_STUDENT` branch → `onViewStudent(studentId)` |
| `pages/HeadCouncillorPage.tsx`, `pages/TeacherPage.tsx` | remove HIGH_RISK tab enum/title/nav/render + import; ensure `onViewStudent` opens the student profile in 学生管理; dashboard activity for `ASSESSMENT_*` / `HIGH_RISK_ASSESSMENT_SUBMITTED` → NOTIFICATIONS tab |
| `components/assessments/AssessmentFlow.tsx` | drop `['high-risk-students']` invalidation |
| Referral creation success path | invalidate notifications query so `发起转诊` disappears after creating |
| `components/records/HighRiskListView.tsx`, `api/highRisk.ts` | delete (+ any tests / MSW handlers / mock data for high-risk) |
| MSW notification mocks | add `canCreateReferral` on high-risk mocks; match backend payload |

## 6. Test strategy (write failing first)
Backend: evaluator alerts HC + teacher with `VIEW_STUDENT`, skips teacher when unassigned; listener no longer creates a referral on HIGH; AssessmentEventListener sends no HC alert; enum codes unique; `@SpringBootTest` for `findStudentIdsWithOpenReferral` (open, DRAFT, RECALLED, CLOSED/REJECTED, none); notification read sets `canCreateReferral` true/false/null.
Frontend: NotificationsView renders teacher alert, shows/hides `发起转诊` per flag, opens creation with pre-filled data, `查看学生` calls `onViewStudent`; pages no longer render 高危名单 nav.

## 7. Open question for sign-off
DDD consultant recommends **also** enforcing "one open referral per student" server-side (`ReferralService.initiateReferral` → `ConflictException` 409). Locked decision 5 only requires hiding the button. Not included unless approved — it also blocks other initiation paths (e.g. teacher creating a referral manually while one is in DRAFT/RECALLED).

## 8. Risks
- Removing auto-referral: notification becomes the only safety net → ERROR log when no recipients.
- Teachers receive two notifications per HIGH submission (COMPLETED + HIGH_RISK_ALERT_TEACHER) — intended.
- HCs re-alerted on each HIGH submission — acceptable; `发起转诊` hidden once referral is open.
