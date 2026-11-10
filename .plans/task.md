# Task Execution Plan: Recent Activity Deep-Linking & Entity Hydration

## 1. Explicit Writable Files List
Only the following 14 files are permitted to be created or modified:
1. `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`
2. `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`
3. `backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`
4. `frontend/src/api/dashboard.ts`
5. `frontend/src/mocks/data/dashboard.ts`
6. `frontend/src/utils/activityNavigation.ts`
7. `frontend/src/utils/activityNavigation.test.ts`
8. `frontend/src/pages/TeacherPage.tsx`
9. `frontend/src/pages/HeadCouncillorPage.tsx`
10. `frontend/src/pages/DoctorPage.tsx`
11. `frontend/src/pages/TrialAdminPage.tsx`
12. `frontend/src/pages/StudentPage.tsx`
13. `frontend/src/pages/AdminPage.tsx`
14. `frontend/src/pages/PageNavigation.test.tsx`
15. `frontend/src/pages/TeacherPage.test.tsx`
16. `frontend/src/pages/HeadCouncillorPage.test.tsx`

---

## 2. Task Order & File-by-File Roadmap

### Task 1: Backend `DashboardActivityDto` & `DashboardService` (TDD)
- **Goal**: Expose `actionTargetId` and `actionType` from `NotificationEntity` in `DashboardActivityDto` so the frontend receives target referral/student IDs for lifecycle notifications.
- **File 1 (Test - RED)**: `backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`
  - Write test `getRecentActivity for TEACHER populates actionTargetId and actionType from notification`: Verify a notification with `actionTargetId = 42L` and `actionType = NotificationActionType.VIEW_STUDENT` produces `DashboardActivityDto` with `actionTargetId == 42L` and `actionType == "VIEW_STUDENT"`.
  - Write test `getRecentActivity for HEAD_COUNSELLOR populates actionTargetId and actionType`: Verify high-risk alert and system notification mappings populate `actionTargetId = 101L` and `actionType == "REVIEW_REFERRAL"`.
  - Write test `getRecentActivity for DOCTOR and TRIAL_ADMIN populates actionTargetId and actionType`: Verify unread notifications propagate target entity IDs.
- **File 2 (DTO - GREEN)**: `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`
  - Add `val actionTargetId: Long? = null` and `val actionType: String? = null` to `DashboardActivityDto`.
- **File 3 (Service - GREEN)**: `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`
  - In `getRecentActivity`, update notification mapping across all roles (`STUDENT`, `TEACHER`, `HEAD_COUNSELLOR`, `TRIAL_ADMIN`, `DOCTOR`):
    - Set `actionTargetId = it.actionTargetId`.
    - Set `actionType = it.actionType.name`.
- **Verification Gate**:
  ```bash
  cd /Volumes/Files/Programming/medical-system/backend && ./mvnw test -Dtest=DashboardServiceTest
  ```

---

### Task 2: Frontend DTO & MSW Mock Parity
- **Goal**: Align frontend TypeScript interface with the backend Kotlin DTO and synchronize MSW mocks with valid entity references (referrals 1..6, students 1..6) and target IDs.
- **File 1**: `frontend/src/api/dashboard.ts`
  - Update `DashboardActivityDto`:
    ```typescript
    export interface DashboardActivityDto {
      id: string;
      type: ActivityType;
      timestamp: string;
      referenceId: number;
      referenceName?: string | null;
      messageCode?: string;
      payload?: Record<string, any>;
      actionTargetId?: number | null;
      actionType?: string | null;
    }
    ```
- **File 2**: `frontend/src/mocks/data/dashboard.ts`
  - In `mockDashboardActivities`:
    - `student`: Point `ref-1` to `referenceId: 1` (`期中考试后急性焦虑`); point `notif-1` to `referenceId: 1`, `actionTargetId: 1`, `actionType: 'VIEW_REFERRAL'`, `payload: { referralId: 1 }`.
    - `teacher`: Set `hr-1` to `referenceId: 1`, `actionTargetId: 1`, `actionType: 'VIEW_STUDENT'`, `payload: { studentId: 1, studentName: '张伟', crisisFlags: '自杀倾向' }`; set `ref-2` to `referenceId: 2` (`李娜`); set `notif-2` to `referenceId: 2`, `actionTargetId: 2`, `actionType: 'VIEW_REFERRAL'`, `payload: { referralId: 2, studentName: '李娜', initiatorName: '张老师' }`.
    - `head-councillor`: Set `ref-1` to `referenceId: 2` (`李娜`, `AWAITING_TRIAGE`); set `hr-2` to `referenceId: 1`, `actionTargetId: 1`, `actionType: 'VIEW_STUDENT'`, `payload: { studentId: 1, studentName: '张伟' }`; set `sys-1` to `referenceId: 4`, `actionTargetId: 4`, `actionType: 'REVIEW_REFERRAL'`, `payload: { referralId: 4, studentName: '陈思宇', initiatorName: '李老师' }`.
    - `trial-admin`: Set `ref-2` to `referenceId: 5`; set `cap-1` to `referenceId: 1`; set `notif-3` to `referenceId: 5`, `actionTargetId: 5`, `actionType: 'CREATE_APPOINTMENT'`, `payload: { referralId: 5, studentName: '孙七' }`.
    - `doctor`: Set `ref-3` to `referenceId: 6`; set `notif-4` to `referenceId: 6`, `actionTargetId: 6`, `actionType: 'VIEW_APPOINTMENT'`, `payload: { referralId: 6, studentName: '周八' }`.
    - `admin`: Ensure all activities reference valid users/entities.
- **Verification Gate**:
  ```bash
  cd /Volumes/Files/Programming/medical-system/frontend && npm run lint
  ```

---

### Task 3: Activity Navigation Resolver (TDD)
- **Goal**: Upgrade `resolveActivityNavigation` to route high-risk/student alerts directly to the Students tab and resolve entity IDs through both `payload` and `actionTargetId` / `actionType`.
- **File 1 (Test - RED)**: `frontend/src/utils/activityNavigation.test.ts`
  - Update existing test: `HIGH_RISK_ASSESSMENT_SUBMITTED` must route to `{ tab: 'Students', entityId: studentId, viewStudentId: studentId }` for roles `teacher`, `head-councillor`, `admin`.
  - Add test: `HIGH_RISK_ASSESSMENT_SUBMITTED` extracts student ID from `actionTargetId` when `payload.studentId` is absent.
  - Add test: `ASSESSMENT_HIGH_RISK_ALERT_*` and `ASSESSMENT_COMPLETED_TEACHER` route to `{ tab: 'Students', entityId: studentId, viewStudentId: studentId }` using `actionTargetId` or `payload.studentId`.
  - Add test: `SYSTEM_NOTIFICATION` and `UNREAD_NOTIFICATION` fall back to `activity.actionTargetId` when `payload.referralId` is missing and `actionType` is a referral action (`VIEW_REFERRAL`, `REVIEW_REFERRAL`, `ASSIGN_DOCTOR`, `CREATE_APPOINTMENT`, `VIEW_APPOINTMENT`, `APPROVE_FEEDBACK`) or `messageCode` starts with `REFERRAL_`.
  - Add test: `SYSTEM_NOTIFICATION` and `UNREAD_NOTIFICATION` fall back to `activity.actionTargetId` when `payload.studentId` is missing and `actionType === 'VIEW_STUDENT'` or message code is student-related.
- **File 2 (Implementation - GREEN)**: `frontend/src/utils/activityNavigation.ts`
  - Identify referral actions:
    ```typescript
    const isReferralAction = 
      ['VIEW_REFERRAL', 'REVIEW_REFERRAL', 'ASSIGN_DOCTOR', 'CREATE_APPOINTMENT', 'VIEW_APPOINTMENT', 'APPROVE_FEEDBACK'].includes(activity.actionType || '') ||
      Boolean(activity.messageCode?.startsWith('REFERRAL_'));
    ```
  - Identify student actions:
    ```typescript
    const isStudentAction = 
      activity.actionType === 'VIEW_STUDENT' ||
      Boolean(activity.messageCode?.startsWith('ASSESSMENT_HIGH_RISK_ALERT_')) ||
      activity.messageCode === 'ASSESSMENT_COMPLETED_TEACHER' ||
      activity.messageCode === 'STUDENT_PROFILE_UPDATED';
    ```
  - Resolve IDs:
    ```typescript
    const referralId = payload?.referralId ?? (isReferralAction ? activity.actionTargetId : undefined);
    const studentId = payload?.studentId ?? (isStudentAction ? activity.actionTargetId : undefined);
    ```
  - Direct High-Risk Assessment routing:
    ```typescript
    if (type === 'HIGH_RISK_ASSESSMENT_SUBMITTED') {
      const targetStudentId = studentId ?? activity.referenceId;
      if (['teacher', 'head-councillor', 'admin'].includes(role)) {
        return { tab: 'Students', entityId: targetStudentId, viewStudentId: targetStudentId };
      }
      return { tab: 'Notifications', viewStudentId: targetStudentId };
    }
    ```
  - Direct Notification routing:
    - Route referral activities to `{ tab: role === 'student' ? 'My Records' : 'Referral Management', entityId: referralId, viewReferralId: referralId }`.
    - Route student activities to `{ tab: 'Students', entityId: studentId, viewStudentId: studentId }` for roles with a Students tab.
- **Verification Gate**:
  ```bash
  cd /Volumes/Files/Programming/medical-system/frontend && npx vitest run src/utils/activityNavigation.test.ts
  ```

---

### Task 4: Role Pages Unified Deep-Linking via `navigateToTab` & Regression Tests
- **Goal**: Replace fragmented ad-hoc `onActivityClick` implementations across all 6 role pages with unified delegation to `navigateToTab(target.tab, target.entityId != null ? String(target.entityId) : undefined)`, trigger existing query-cached entity fetches with `baseInfo` unwrapping, and show `无法加载数据详情，请重试` on network failures.
- **File 1**: `frontend/src/pages/TeacherPage.tsx`
- **File 2**: `frontend/src/pages/HeadCouncillorPage.tsx`
- **File 3**: `frontend/src/pages/DoctorPage.tsx`
- **File 4**: `frontend/src/pages/TrialAdminPage.tsx`
- **File 5**: `frontend/src/pages/StudentPage.tsx`
- **File 6**: `frontend/src/pages/AdminPage.tsx`
- **File 7 (Test - Regression & Deep-Linking)**: `frontend/src/pages/PageNavigation.test.tsx`
- **Verification Gate**:
  ```bash
  cd /Volumes/Files/Programming/medical-system/frontend && npx vitest run src/pages/PageNavigation.test.tsx
  cd /Volumes/Files/Programming/medical-system/frontend && npm run lint
  cd /Volumes/Files/Programming/medical-system/frontend && npm run build
  ```

---

## 3. TDD Test Cases & Verification Gate Commands Summary

| Step | Scope | Red/Green Command | Expected Outcome |
|------|-------|-------------------|------------------|
| **1.1** | Backend Tests Red | `./mvnw test -Dtest=DashboardServiceTest` | Fails because `actionTargetId`/`actionType` are missing |
| **1.2** | Backend Impl Green | `./mvnw test -Dtest=DashboardServiceTest` | Passes: notification mapping outputs `actionTargetId` and `actionType` |
| **2.1** | Frontend Types & Mocks | `npm run lint` | TypeScript passes with new DTO fields and mock parity |
| **3.1** | Resolver Tests Red | `npx vitest run src/utils/activityNavigation.test.ts` | Fails on new high-risk routing and actionTargetId fallback |
| **3.2** | Resolver Impl Green | `npx vitest run src/utils/activityNavigation.test.ts` | All resolver unit tests pass (100% green) |
| **4.1** | Page Deep-Linking Tests | `npx vitest run src/pages/PageNavigation.test.tsx` | All page navigation and error fallback tests pass |
| **Gate** | Full Frontend Verification | `npm run lint && npm run test && npm run build` | Zero TS errors, all tests pass, build succeeds |
| **Gate** | Full Backend Verification | `./mvnw test` | All backend unit and integration tests pass |
