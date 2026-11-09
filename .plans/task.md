# Implementation Plan: Dashboard Recent Activity Notification Resolution

## Overview
This implementation plan resolves the issue where the "Recent Activity" (`近期动态`) feed on user dashboards (Teachers, Head Councillors, Trial Admins, Doctors) displays ambiguous generic text `"系统通知"` instead of the actual notification message.
To uphold the `GEMINI.md` architectural invariant of a **Language-Agnostic Backend**, the backend projects the notification enum `messageCode: String?` and parsed JSON `payload: Map<String, Any>?`. The frontend resolves localized Chinese presentation strings through a single, shared, framework-agnostic text formatter (`notificationText.ts`), used by both `activityMapper.ts` and `NotificationsView.tsx`.

---

## Strict Writable Files Boundary

The execution agent MUST operate strictly within this exhaustive whitelist of 10 files (3 created, 7 modified). No other files may be created, edited, or deleted.

### 1. Created Files (3)
- `frontend/src/utils/notificationText.test.ts`
- `frontend/src/utils/notificationText.ts`
- `frontend/src/utils/activityMapper.test.ts`

### 2. Modified Files (7)
- `frontend/src/utils/activityMapper.ts`
- `frontend/src/components/notifications/NotificationsView.tsx`
- `frontend/src/api/dashboard.ts`
- `frontend/src/mocks/data/dashboard.ts`
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`

---

## Detailed TDD Task Sequence (Red-Green-Refactor)

### Task 1: Shared Notification Formatter (`notificationText.ts`)

#### 1.1 Red — Write Failing Unit Test
- **File**: `frontend/src/utils/notificationText.test.ts` (NEW)
- **Action**: Create comprehensive test suite testing pure function `getNotificationText`:
  - Test referral notification codes:
    - `REFERRAL_SUBMITTED_STUDENT`: "由 教师 发起的转诊申请已成功提交。" (or custom `initiatorName`).
    - `REFERRAL_SUBMITTED_INITIATOR`: "您为 张三 发起的转诊申请已成功记录，并进入后续评估流程。"
    - `REFERRAL_REQUIRES_REVIEW_HC`: "由 教师 为 李四 发起的转诊申请需要您审核。"
    - `REFERRAL_CREATED_FOR_STUDENT_TEACHER`: "心理咨询师 王五 为您的学生 赵六 发起了转诊申请。"
    - `REFERRAL_APPROVED_BY_HC_TEACHER` and `REFERRAL_APPROVED_BY_HC_STUDENT`: "转诊中心已审核通过 钱七 的转诊申请，正在等待医院分诊。"
    - `REFERRAL_NEEDS_TRIAGE_ADMIN`: "有一份关于 孙八 的新转诊申请，请及时分配医生。"
    - `REFERRAL_DOCTOR_ASSIGNED_DOCTOR`: "您被分配了一份关于 周九 的转诊申请，请尽快安排就诊时间。"
    - `REFERRAL_DOCTOR_ASSIGNED_*` (`TEACHER`, `STUDENT`, `HC`): "吴十 的转诊申请已分配医生，正在等待排期。"
    - `REFERRAL_SCHEDULED_*`: "医生已为 郑十一 安排了就诊时间。"
    - `REFERRAL_FEEDBACK_SUBMITTED_HC`: "医生已提交 王十二 的就诊反馈，请审核。"
    - `REFERRAL_FEEDBACK_SUBMITTED_*` (`TEACHER`, `ADMIN`, `STUDENT`): "医生已提交 王十二 的就诊反馈。"
    - `REFERRAL_CLOSED_*`: "冯十三 的转诊流程已完成并关闭。"
    - `REFERRAL_REJECTED_*`: "关于 陈十四 的转诊申请已被拒绝。"
    - `REFERRAL_NEEDS_REASSIGNMENT_ADMIN`: "医生要求重新分配 褚十五 的转诊申请，请处理。"
    - `REFERRAL_RECALLED_HC`: "关于 卫十六 的转诊申请已被撤回。"
  - Test assessment notification codes:
    - `ASSESSMENT_HIGH_RISK_ALERT_HC` and `ASSESSMENT_HIGH_RISK_ALERT_TEACHER`:
      - With `crisisFlags`: "学生 蒋十七 的心理测评结果触发高危预警（自杀意念），请及时关注并干预处理。"
      - Without `crisisFlags`: "学生 蒋十七 的心理测评结果触发高危预警，请及时关注并干预处理。"
    - `ASSESSMENT_ASSIGNED_STUDENT`: "您收到了一项新的心理健康测评任务，请及时前往完成测评。"
    - `ASSESSMENT_COMPLETED_TEACHER`: "您的学生 沈十八 已完成心理健康测评。"
  - Test fallback and edge cases:
    - Missing or null `studentName`: defaults to `'未知学生'`.
    - Missing or null `initiatorName`: defaults to `'教师'`.
    - Unknown or unmapped `messageCode`: formats underscore-separated code (e.g. `'SOME_UNKNOWN_CODE'` -> `'SOME UNKNOWN CODE'`).
    - Missing `messageCode` or undefined parameter: returns empty string `""`.
- **Dependencies**: None.

#### 1.2 Green — Implement Formatter
- **File**: `frontend/src/utils/notificationText.ts` (NEW)
- **Action**: Implement pure, framework-agnostic string formatter matching all message codes and fallbacks.
- **Verification**: Run `npx vitest run src/utils/notificationText.test.ts`.

---

### Task 2: Activity Mapper Integration (`activityMapper.ts`)

#### 2.1 Red — Write Failing Unit Test
- **File**: `frontend/src/utils/activityMapper.test.ts` (NEW)
- **Action**: Test `mapActivityTypeToUI`:
  - When `activity.messageCode` is present:
    - High-risk alert activity (`HIGH_RISK_ASSESSMENT_SUBMITTED`) with `messageCode: 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER'` and `payload: { studentName: '李华', crisisFlags: '高危预警' }`:
      - Asserts `title` is `"学生 李华 的心理测评结果触发高危预警（高危预警），请及时关注并干预处理。"`
      - Asserts `statusText` is `"高危预警"` and `statusType` is `"error"`.
    - Unread notification activity (`UNREAD_NOTIFICATION`) with `messageCode: 'REFERRAL_DOCTOR_ASSIGNED_DOCTOR'` and `payload: { studentName: '王五' }`:
      - Asserts `title` is `"您被分配了一份关于 王五 的转诊申请，请尽快安排就诊时间。"`
      - Asserts `statusText` is `"未读"` and `statusType` is `"info"`.
    - System notification activity (`SYSTEM_NOTIFICATION`) with `messageCode: 'REFERRAL_NEEDS_TRIAGE_ADMIN'` and `payload: { studentName: '张三' }`:
      - Asserts `title` is `"有一份关于 张三 的新转诊申请，请及时分配医生。"`
      - Asserts `statusText` is `"系统"` and `statusType` is `"neutral"`.
  - When `activity.messageCode` is NOT present:
    - Activity with `referenceName = '焦虑情绪转诊'` and `type = 'REFERRAL_PENDING_TRIAGE'`:
      - Asserts `title` is `"转诊单: 焦虑情绪转诊"`.
    - Activity with `referenceName = null` and no `messageCode`:
      - Asserts `title` falls back to `'系统通知'`.
  - Other entity activities retain prefix rules:
    - `ASSESSMENT_PENDING_COMPLETION` prefixes `测评: ${title}`.
    - `USER_APPROVAL_PENDING` prefixes `用户注册: ${title}`.
- **Dependencies**: Task 1.

#### 2.2 Green — Integrate Shared Formatter into Mapper
- **File**: `frontend/src/utils/activityMapper.ts`
- **Action**: Import `getNotificationText` and resolve title.
- **Verification**: Run `npx vitest run src/utils/activityMapper.test.ts`.

---

### Task 3: Refactor `NotificationsView.tsx` to Use Shared Formatter

#### 3.1 Verification of Existing Tests
- Ensure `src/components/notifications/NotificationsView.test.tsx` passes prior to refactoring.

#### 3.2 Refactor Implementation
- **File**: `frontend/src/components/notifications/NotificationsView.tsx`
- **Action**:
  - Import `getNotificationText` from `../../utils/notificationText`.
  - Remove redundant local `getNotificationText` declaration (lines 17–75).
- **Verification**: Run `npx vitest run src/components/notifications/NotificationsView.test.tsx`.

---

### Task 4: Frontend API DTO & Mock Parity

#### 4.1 Update Frontend DTO Interface
- **File**: `frontend/src/api/dashboard.ts`
- **Action**: Add `messageCode?: string;` and `payload?: Record<string, any>;` to `DashboardActivityDto`.

#### 4.2 Synchronize MSW Mock Database
- **File**: `frontend/src/mocks/data/dashboard.ts`
- **Action**: Populate `messageCode` and `payload` for notification-backed activities across all roles.
- **Verification**: Run `npm run lint` (`tsc --noEmit`).

---

### Task 5: Backend DTO & Service (`DashboardActivityDto.kt` & `DashboardService.kt`)

#### 5.1 Red — Write Unit Tests for Backend Projection
- **File**: `backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`
- **Action**:
  - Update `setup()` to supply `ObjectMapper()` when instantiating `DashboardService`.
  - Add test: `getRecentActivity for TEACHER populates messageCode and payload from notification`.
  - Add test: `getRecentActivity for TEACHER includes both high-risk alert and completed codes in query`.
  - Add test: `getRecentActivity for HEAD_COUNSELLOR populates messageCode and payload for high-risk and unread system notifications`.
  - Add test: `getRecentActivity for DOCTOR and TRIAL_ADMIN populates messageCode and payload for unread notifications`.
  - Add test: `getRecentActivity safely handles corrupted or blank notification payload`.

#### 5.2 Green — Implement Backend DTO and Service Mapping
- **File**: `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`:
  - Add `messageCode: String? = null` and `payload: Map<String, Any>? = null`.
- **File**: `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`:
  - Inject `ObjectMapper`.
  - Implement safe parsing helper `parsePayload(json: String?): Map<String, Any>?`.
  - Update Teacher high-risk query to check `IN (:codes)` with both `ASSESSMENT_HIGH_RISK_ALERT_TEACHER` and `ASSESSMENT_COMPLETED_TEACHER`.
  - Populate `messageCode = it.messageCode.name` and `payload = parsePayload(it.payload)` across Teacher, Head Councillor, Trial Admin, and Doctor.
- **Verification**: Run `./mvnw test -Dtest=DashboardServiceTest`.

---

## Verification Commands
1. Frontend Tests: `cd frontend && npm run test`
2. Frontend Type Check: `cd frontend && npm run lint`
3. Backend Test Suite: `cd backend && ./mvnw test`
