# Intent Lock: Assign Students to Teacher Workflow

## 1. High-Level Scope
- Address the student–teacher assignment gap so both **`SYSTEM_ADMIN`** and **`HEAD_COUNSELLOR`** can view teachers, inspect each teacher's assigned students (caseload), assign/reassign students to a teacher via a bottom sheet with student search, and unassign students from a teacher.
- Replace hardcoded mock data in Head Counselor's Staff views (`StaffManagementView`, `StaffDetailsView`) with real backend `/api/teachers` endpoints (also usable by Admin).
- When a student is assigned to a teacher, the teacher immediately receives a notification and sees the student in their student list (and downstream risk/assessment/referral workflows automatically apply).

## 2. Backend & Data Contracts
- **New `TeacherController` (`/api/teachers`)** — accessible to `SYSTEM_ADMIN` and `HEAD_COUNSELLOR` only (`403 Forbidden` for other roles):
  - `GET /api/teachers` — list teachers (summary DTO: `id`/`userId`, `name`, `employeeNumber`, `collegeName`, `collegeId`, `status`, `phone`, `email`, `assignedStudentCount`). Optional query params (`status`, `keyword`, etc. as needed).
  - `GET /api/teachers/{teacherId}` — teacher detail DTO including profile metadata (`id`/`userId`, `name`, `employeeNumber`, `collegeName`, `status`, `phone`, `email`, `assignedStudentCount`, and list of currently assigned students as `StudentDto` or summary items).
  - `POST /api/teachers/{teacherId}/students` — batch assign/reassign `studentIds: List<Long>` to `{teacherId}`.
    - **Validation / Guards**:
      - Target teacher must exist (`404 NotFoundException`) and have `AccountStatus.ACTIVE` (`400 ValidationException` / `409 ConflictException` if `PENDING`, `DISABLED`, or `DELETED`).
      - Each `studentId` must exist (`404 NotFoundException`).
      - Idempotent if a student is already assigned to `{teacherId}` (do NOT emit duplicate notification if already assigned to the same teacher).
  - `DELETE /api/teachers/{teacherId}/students/{studentId}` — unassign `{studentId}` from `{teacherId}` (sets `assignedTeacher = null`). Validates teacher exists and student is currently assigned to `{teacherId}` (or returns `404`/`409` if not).
- **`StudentDto` Enrichment**:
  - Add nullable `assignedTeacherId: Long? = null` and `assignedTeacherName: String? = null` to `StudentDto` and `StudentMapper` (and corresponding frontend `Student` / `StudentDto` TypeScript types + MSW mocks).
- **Notifications & Domain Events**:
  - Add new `NotificationMessageCode` (e.g., `STUDENT_ASSIGNED_TEACHER` with next unused 1-based ordinal) and update `NotificationMessageCodeConverter` / tests if needed.
  - Language-agnostic backend: `NotificationService.createNotification` passes `messageCode = STUDENT_ASSIGNED_TEACHER`, `payload` (e.g., `studentName`, `studentNumber`, `assignerName`), `actionType = NotificationActionType.VIEW_STUDENT`, `actionTargetId = studentId`.
  - Send **one notification per newly assigned student** (including reassignments from another teacher, excluding no-op same-teacher assignments) to the target teacher (`teacherId`).
  - No notifications to students or previous teachers on assignment/reassignment/unassignment.
- **CSV Overwrite Bug Fix (In Scope)**:
  - In `StudentImportService.updateExistingStudent`, preserve `existingStudent.assignedTeacher` when `row.teacherEmployeeNumber` is null/blank instead of wiping it out to `null`.

## 3. Frontend UI/UX & Components
- **Material Design 3 Strict Rule**: No native `<input>`, `<textarea>`, or `<select>` elements; strictly use MD3 Web Components (`<md-outlined-text-field>`, `<md-checkbox>`, `<md-filter-chip>`, `PrimaryButton`, `SecondaryButton`, `GenericDialog`, etc.).
- **Head Counselor Teacher Views (`StaffManagementView` & `StaffDetailsView`)**:
  - Wire `StaffManagementView` to `GET /api/teachers` (real API + MSW fallback) instead of hardcoded `counselors`.
  - Wire `StaffDetailsView` to `GET /api/teachers/{id}` showing real teacher metadata (name, employeeNumber, college, status, contact info) + real `"负责学生"` caseload list with `"分配学生"` button and per-student unassign action (with confirmation `GenericDialog`).
  - Remove fake hardcoded `audit` / `scopes` mock tabs and no-op `"暂停访问"` / `"重置登录凭据"` footer buttons.
- **Admin Teacher Details (`UserDetailsView`)**:
  - When viewing a user with `role === 'TEACHER'`, render the shared `"负责学生"` caseload section (fetching from `GET /api/teachers/{id}`) with `"分配学生"` button and per-student unassign action (with confirmation).
  - Keep `UserGovernanceFooter` solely for account governance (`ACTIVE`/`DISABLED`/`DELETED`).
  - Disable `"分配学生"` button (or show helper hint) when teacher status is not `ACTIVE`.
- **Assign Student Bottom Sheet (`CreationOverlayProvider`)**:
  - Triggered via `openCreation('分配学生', <AssignStudentsBottomSheet ... />)`.
  - Contains:
    - `<md-outlined-text-field>` student search input (300ms debounce, matching `name`, `studentNumber`, `major`).
    - Filter chips (`<md-filter-chip>`): `"仅看未分配"` ON by default, toggleable to `"全部学生"`.
    - Student rows with `<md-checkbox>` multi-select, showing student name, student number, major, risk badge, and current assigned teacher badge (if any).
    - Students already assigned to *this* teacher are shown as disabled / marked `"已分配"`.
    - Loading, empty search, and error states.
    - Submit action (`PrimaryButton`): if any selected student already has a *different* assigned teacher, open a confirmation `GenericDialog` warning about reassignment before submitting `POST /api/teachers/{teacherId}/students`.
    - On success: invalidate teacher detail, teacher list, and student queries; show success snackbar; close bottom sheet.
- **Teacher Notification & Students List Integration**:
  - Update `frontend/src/utils/notificationText.ts`, `NotificationsView.tsx`, `activityMapper.ts`, `activityNavigation.ts` to render `STUDENT_ASSIGNED_TEACHER` localized Chinese text and handle `VIEW_STUDENT` navigation so clicking the notification navigates the teacher to their Students view with that student selected.
  - Wire `StudentsView`'s `'导师'` filter chip to real `assignedTeacherName` values from `StudentDto`.
- **MSW Mock Parity**:
  - Add `/api/teachers` MSW handlers (`GET /api/teachers`, `GET /api/teachers/{id}`, `POST /api/teachers/{id}/students`, `DELETE /api/teachers/{id}/students/{studentId}`) and align `mockStudentsDb` / `mockAdminUsersDb` with `assignedTeacherId` & `assignedTeacherName`.

## 4. Out of Scope
- Auto-assigning teachers during mobile self-registration (`AuthService.registerStudent`).
- Re-introducing or building real backend `audit` logs / `scopes` permission tables for Head Counselor's Staff view.
- Notifying students or previous teachers when teacher assignments change.
