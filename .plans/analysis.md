# Root Cause Analysis: Recent Activity Entity Deep-Linking & Detail Panel Hydration

## 1. Problem Statement & Locked Requirements
- **Symptom**: Clicking a `系统` (`SYSTEM_NOTIFICATION`) or other notification/entity-backed entry in the dashboard's Recent Activity (`近期动态`) list switches to the Referral Management (or Students) page, but fails to open the specific referral or student detail panel/drawer.
- **Locked Requirements**:
  1. **Universal Entity Deep-Linking**: Across all roles (Teacher, Head Councillor, Doctor, Trial Admin, Student, Admin), clicking any recent activity tied to a specific referral, student, or user must navigate to the target page **and immediately open the detail panel/drawer** for that entity.
  2. **High-Risk & Student Assessment Activities**: Clicking a high-risk assessment alert (`HIGH_RISK_ASSESSMENT_SUBMITTED` / `ASSESSMENT_HIGH_RISK_ALERT_*`) or student assessment completion (`ASSESSMENT_COMPLETED_TEACHER`) in Recent Activity must route directly to the **Students** page and open that specific student's detail panel.
  3. **Fallback & Error Handling**: Navigate to the target list page and fetch/open the detail panel; if the entity fetch fails, stay on the list page and display a snackbar notification (`无法加载数据详情，请重试`).

---

## 2. Root Causes Identified

### Cause 1: Backend `DashboardActivityDto` Omits `actionTargetId` and `actionType`
- **Files**:
  - `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardActivityDto.kt`
  - `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`
  - `backend/src/main/kotlin/com/medicalsystem/backend/policy/LifecycleNotificationRoutingPolicy.kt`
- **Mechanism**:
  - `NotificationEntity` stores the target entity's primary key (`referral.id` or `student.id`) in `actionTargetId: Long?` alongside `actionType: NotificationActionType` (`VIEW_REFERRAL`, `REVIEW_REFERRAL`, `ASSIGN_DOCTOR`, `CREATE_APPOINTMENT`, `VIEW_APPOINTMENT`, `APPROVE_FEEDBACK`, `VIEW_STUDENT`, `VIEW_RECORDS`).
  - None of the 22 status-transition notifications in `LifecycleNotificationRoutingPolicy.kt` include `"referralId"` in `payload`—they rely on `actionTargetId = referral.id`.
  - However, `DashboardService.getRecentActivity` sets `referenceId = it.id` (the notification's own database ID) and does not project `actionTargetId` or `actionType` onto `DashboardActivityDto`. As a result, the frontend receives no referral ID for lifecycle notifications.

### Cause 2: Frontend Mock Activities Lack Target IDs & Valid Entity References
- **File**: `frontend/src/mocks/data/dashboard.ts`
- **Mechanism**:
  - Mock notification activities (`hr-1`, `notif-2`, `hr-2`, `sys-1`, `notif-3`, `notif-4`) omit `referralId`, `studentId`, and `actionTargetId`, and several mock activities use arbitrary `referenceId` values (`201..207`) that do not exist in `mockReferrals` (`1..6`) or `mockStudents` (`1..6`).
  - Consequently, `resolveActivityNavigation` finds neither `payload.referralId` nor `actionTargetId`, returning `{ tab: 'Referral Management' }` with `entityId: undefined`.

### Cause 3: Incomplete `resolveActivityNavigation` & Bypassed `navigateToTab` Hydration in Role Pages
- **Files**:
  - `frontend/src/utils/activityNavigation.ts`
  - `frontend/src/pages/TeacherPage.tsx`
  - `frontend/src/pages/HeadCouncillorPage.tsx`
  - `frontend/src/pages/DoctorPage.tsx`
  - `frontend/src/pages/TrialAdminPage.tsx`
  - `frontend/src/pages/StudentPage.tsx`
  - `frontend/src/pages/AdminPage.tsx`
- **Mechanism**:
  1. `resolveActivityNavigation` routes `HIGH_RISK_ASSESSMENT_SUBMITTED` to `tab: 'Notifications'` instead of `tab: 'Students'` with `entityId: studentId`, and does not fall back to `activity.actionTargetId` when `payload.referralId` / `payload.studentId` is absent.
  2. All 6 role pages already implement a `useEffect([lastEvent])` listener via `useNavigation()` that switches tabs, fetches the full entity (`/api/referrals/${id}`, `/api/students/${id}`, `/api/users/${id}`), unwraps `data.baseInfo`, opens the detail drawer, and displays `showSnackbar({ message: '无法加载数据详情，请重试' })` on error.
  3. Instead of delegating to `navigateToTab(target.tab, target.entityId ? String(target.entityId) : undefined)`, the role pages used ad-hoc `onActivityClick` logic:
     - `StudentPage.tsx` ignored `target.entityId` completely.
     - `HeadCouncillorPage.tsx`, `DoctorPage.tsx`, `TrialAdminPage.tsx`, and `AdminPage.tsx` set an unhydrated stub `setSelectedItem({ id })` (leaving drawer header fields blank and bypassing error snackbars) or called `handlePageChange` (which clears `selectedItem`).
     - `AdminPage.tsx`'s `lastEvent` effect only handled `USERS` and `ASSESSMENTS`, missing `REFERRALS` and `STUDENTS`.

---

## 3. Proposed Fix Strategy

1. **Backend (`DashboardActivityDto.kt` & `DashboardService.kt`)**:
   - Add `val actionTargetId: Long? = null` and `val actionType: String? = null` to `DashboardActivityDto`.
   - In `DashboardService.getRecentActivity`, populate `actionTargetId = it.actionTargetId` and `actionType = it.actionType.name` for all notification-sourced activities across `STUDENT`, `TEACHER`, `HEAD_COUNCILLOR`, `TRIAL_ADMIN`, and `DOCTOR`.
2. **Frontend Contract & Mocks (`frontend/src/api/dashboard.ts` & `frontend/src/mocks/data/dashboard.ts`)**:
   - Add `actionTargetId?: number | null;` and `actionType?: string | null;` to `DashboardActivityDto` in `frontend/src/api/dashboard.ts`.
   - Update `mockDashboardActivities` in `frontend/src/mocks/data/dashboard.ts` so all referral, student, and notification activities reference valid mock entity IDs and include `actionTargetId` / `actionType` and `payload` IDs.
3. **Frontend Activity Navigation Resolver (`frontend/src/utils/activityNavigation.ts`)**:
   - Resolve target referral ID from `payload?.referralId ?? (isReferralActionOrCode ? actionTargetId : undefined)`.
   - Resolve target student ID from `payload?.studentId ?? (isStudentActionOrCode ? actionTargetId : undefined)`.
   - Route `HIGH_RISK_ASSESSMENT_SUBMITTED`, `ASSESSMENT_HIGH_RISK_ALERT_*`, and `ASSESSMENT_COMPLETED_TEACHER` directly to `{ tab: 'Students', entityId: studentId, viewStudentId: studentId }` for roles with a Students tab (`teacher`, `head-councillor`, `admin`).
4. **Unified Entity Hydration via `navigateToTab` Across All 6 Role Pages**:
   - In `StudentPage.tsx`, `TeacherPage.tsx`, `HeadCouncillorPage.tsx`, `DoctorPage.tsx`, `TrialAdminPage.tsx`, and `AdminPage.tsx`, wire `onActivityClick` to call `navigateToTab(target.tab, target.entityId != null ? String(target.entityId) : undefined)`.
   - In `AdminPage.tsx`, extend the `lastEvent` effect to fetch `/api/referrals/${lastEvent.entityId}` for `AdminTabs.REFERRALS` and `/api/students/${lastEvent.entityId}` for `AdminTabs.STUDENTS`, and unwrap `data.baseInfo ? data.baseInfo : data`.
