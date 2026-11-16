# Implementation Plan: Assign Students to Teacher Workflow

**Status**: Phase 2 Implementation Plan (TDD)  
**Sources**:
- [intent-lock.md](file:///Volumes/Files/Programming/medical-system/.plans/intent-lock.md)
- [architecture.md](file:///Volumes/Files/Programming/medical-system/.plans/architecture.md)

---

## 1. Verified Codebase Notes & Architecture Discrepancies

1. **Teacher Repository Location**: There are no standalone `TeacherRepository.kt` or `TeacherJpaRepository.kt` files. `TeacherRepository` lives in `backend/src/main/kotlin/com/medicalsystem/backend/repository/ProfileRepositories.kt`, and `TeacherJpaRepository` lives in `backend/src/main/kotlin/com/medicalsystem/backend/repository/UserJpaRepository.kt`. `TeacherService` will inject `TeacherRepository` (from `ProfileRepositories.kt`) and `UserJpaRepository` without creating duplicate repository files.
2. **Domain Events File**: Existing domain events (`ReferralInitiatedEvent`, `StudentRegisteredEvent`, `StaffRegisteredEvent`, etc.) live in `backend/src/main/kotlin/com/medicalsystem/backend/event/Events.kt` (package `com.medicalsystem.backend.event`). `StudentAssignedToTeacherEvent` will be added to `Events.kt`.
3. **Additional Frontend Consumers of Staff Components**:
   - `frontend/src/pages/TrialAdminPage.tsx` and `frontend/src/pages/DoctorPage.tsx` both import `StaffManagementView` and `StaffDetailsView, STAFF_DETAILS_TABS`. Keeping `STAFF_DETAILS_TABS` exported from `StaffDetailsView.tsx` and using `selectedStaffId?: string | number` in `StaffManagementView.tsx` prevents `tsc --noEmit` regressions.
   - `frontend/src/pages/HeadCouncillorPage.tsx` (lines 349, 354) and `TrialAdminPage.tsx` (lines 277, 278) currently check `selectedItem?.employeeId` and `selectedItem?.department` (from the old hardcoded `Counselor` type). They must be updated to recognize `TeacherSummaryDto` (`employeeNumber`, `collegeName`).
4. **`NotificationsView.tsx` Ordering Guard**: `getNotificationTitle` and `getNotificationIcon` in `frontend/src/components/notifications/NotificationsView.tsx` match `.includes('ASSIGNED')` as a fallback for referral doctor assignments (`'已分配医生'` / `'local_hospital'`). `STUDENT_ASSIGNED_TEACHER` (`'学生分配通知'` / `'person_add'`) MUST be matched before `.includes('ASSIGNED')`.
5. **Existing Teacher Test Wrappers**: `frontend/src/components/admin/UserDetailsView.test.tsx` renders a `TEACHER` user without `CreationOverlayProvider` or `SnackbarProvider`. Once `UserDetailsView` renders `TeacherCaseloadSection`, that test file must wrap with those providers and mock `/api/teachers/2`.

---

## 2. Writable Files Whitelist

### Backend Main Files
- `backend/src/main/kotlin/com/medicalsystem/backend/model/NotificationMessageCode.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/event/Events.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/event/NotificationEventListener.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/StudentDto.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/TeacherDtos.kt` *(new)*
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/StudentJpaRepository.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentMapper.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/TeacherService.kt` *(new)*
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/TeacherController.kt` *(new)*

### Backend Test Files
- `backend/src/test/kotlin/com/medicalsystem/backend/model/NotificationEnumsTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/event/NotificationEventListenerTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/mapper/StudentMapperTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentServiceTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportServiceTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/repository/StudentJpaRepositoryTeacherCaseloadTest.kt` *(new)*
- `backend/src/test/kotlin/com/medicalsystem/backend/service/TeacherServiceTest.kt` *(new)*
- `backend/src/test/kotlin/com/medicalsystem/backend/controller/TeacherControllerTest.kt` *(new)*

### Frontend Main Files
- `frontend/src/types/index.ts`
- `frontend/src/api/students.ts`
- `frontend/src/api/teachers.ts` *(new)*
- `frontend/src/components/staff/AssignStudentsBottomSheet.tsx` *(new)*
- `frontend/src/components/staff/TeacherCaseloadSection.tsx` *(new)*
- `frontend/src/components/staff/StaffManagementView.tsx`
- `frontend/src/components/staff/StaffDetailsView.tsx`
- `frontend/src/components/admin/UserDetailsView.tsx`
- `frontend/src/components/students/StudentsView.tsx`
- `frontend/src/utils/notificationText.ts`
- `frontend/src/components/notifications/NotificationsView.tsx`
- `frontend/src/utils/activityNavigation.ts`
- `frontend/src/pages/HeadCouncillorPage.tsx`
- `frontend/src/pages/TrialAdminPage.tsx`
- `frontend/src/pages/TeacherPage.tsx`

### Frontend MSW Mock Files
- `frontend/src/mocks/data/teachers.ts` *(new)*
- `frontend/src/mocks/data/students.ts`
- `frontend/src/mocks/db.ts`
- `frontend/src/mocks/handlers.ts`

### Frontend Test Files
- `frontend/src/mocks/handlers.test.ts`
- `frontend/src/utils/notificationText.test.ts`
- `frontend/src/utils/activityNavigation.test.ts`
- `frontend/src/components/notifications/NotificationsView.test.tsx`
- `frontend/src/components/staff/AssignStudentsBottomSheet.test.tsx` *(new)*
- `frontend/src/components/staff/TeacherCaseloadSection.test.tsx` *(new)*
- `frontend/src/components/staff/StaffManagementView.test.tsx` *(new)*
- `frontend/src/components/staff/StaffDetailsView.test.tsx` *(new)*
- `frontend/src/components/admin/UserDetailsView.test.tsx`
- `frontend/src/components/admin/AdminUserManagementDetails.test.tsx`
- `frontend/src/components/students/StudentsView.test.tsx`
- `frontend/src/pages/TeacherPage.test.tsx`

---

## 3. TDD Task Breakdown (Ordered)

### Part A: Backend (Red -> Green -> Refactor)

#### Task B1: Notification Message Code & Domain Event Listener
- **Red**:
  - In `NotificationEnumsTest.kt`, add `testNotificationMessageCodeStudentAssignedTeacher()` asserting `NotificationMessageCode.STUDENT_ASSIGNED_TEACHER.code == 35`, `fromCode(35) == STUDENT_ASSIGNED_TEACHER`, and uniqueness of all enum codes.
  - In `NotificationEventListenerTest.kt`, add test for `handleStudentAssignedToTeacher(event: StudentAssignedToTeacherEvent)` asserting `notificationService.saveNotification(...)` is called once for `userId = event.teacherId` with `messageCode = STUDENT_ASSIGNED_TEACHER`, `actionType = VIEW_STUDENT`, `actionTargetId = event.studentId`, `isActionAvailable = true`, and `payload` containing `studentId`, `studentName`, `studentNumber`, `assignerName`.
- **Green**:
  - Add `STUDENT_ASSIGNED_TEACHER(35)` to `NotificationMessageCode.kt`.
  - Add `StudentAssignedToTeacherEvent` to `Events.kt` (`studentId`, `studentName`, `studentNumber`, `teacherId`, `previousTeacherId`, `assignerName`, `occurredOn`).
  - Add `@Async @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) fun handleStudentAssignedToTeacher(event: StudentAssignedToTeacherEvent)` in `NotificationEventListener.kt`.
- **Refactor**: Keep listener constructor unchanged so existing listener tests remain intact.

#### Task B2: `StudentDto` Enrichment, `StudentMapper` & N+1 Batch Lookup in `StudentService`
- **Red**:
  - In `StudentMapperTest.kt`, add tests verifying:
    1. `toModel` populates `assignedTeacherId` from `entity.assignedTeacher?.userId`.
    2. `toDto(model, teacherNameLookup)` populates `assignedTeacherId` and `assignedTeacherName` from the batch lookup map without hitting `userJpaRepository`.
    3. `toDto(model)` falls back to `userJpaRepository?.findById(teacherId)` when lookup map is omitted, and returns `null` when `assignedTeacherId == null`.
  - In `StudentServiceTest.kt`, add tests verifying:
    1. `fetchAllStudents(user)` collects distinct `assignedTeacherId` values, invokes `userJpaRepository.findAllById(...)` once (not per student), and maps `assignedTeacherId`/`assignedTeacherName` onto returned `StudentDto`s.
    2. `fetchStudentDetails(id, user)` returns `StudentDto` with `assignedTeacherId` and `assignedTeacherName`.
- **Green**:
  - Add `val assignedTeacherId: Long? = null` and `val assignedTeacherName: String? = null` to `StudentDto.kt` (at the end with default `null` values for backward compatibility).
  - Update `StudentMapper.kt`: add `toDto(model: Student, teacherNameLookup: Map<Long, String>?)` and delegate `toDto(model: Student)` to `toDto(model, null)` (resolving via `teacherNameLookup?.get(teacherId) ?: userJpaRepository?.findById(teacherId)?.orElse(null)?.name`).
  - Update `StudentService.kt` (injecting `UserJpaRepository`) so `fetchAllStudents` batch-fetches teacher names via `userJpaRepository.findAllById(teacherIds)` before mapping.
- **Refactor**: Extract private `resolveTeacherNames(students: List<Student>): Map<Long, String>` helper in `StudentService.kt`.

#### Task B3: CSV Bulk Import Overwrite Regression Fix
- **Red**:
  - In `StudentImportServiceTest.kt`, add two tests for `commitImport(..., overwriteDuplicates = true)`:
    1. When `row.teacherEmployeeNumber` is `null` or blank (`"  "`), `existingStudent.assignedTeacher` is preserved (NOT overwritten to `null`).
    2. When `row.teacherEmployeeNumber` is non-blank (e.g., `"EMP-00001"`), `existingStudent.assignedTeacher` is updated to the resolved `TeacherEntity`.
- **Green**:
  - Update `StudentImportService.updateExistingStudent` so `teacherEntity` is resolved only when `!row.teacherEmployeeNumber.isNullOrBlank()`, and `existingStudent.assignedTeacher = teacherEntity` is executed only when `!row.teacherEmployeeNumber.isNullOrBlank()`.
- **Refactor**: Keep new-student registration in `registerNewStudent` cleanly handling optional `teacherEmployeeNumber`.

#### Task B4: `StudentJpaRepository` Caseload Queries & Integration Verification
- **Red**:
  - Create `StudentJpaRepositoryTeacherCaseloadTest.kt` (`@SpringBootTest`, `@Transactional`) testing:
    1. `countAssignedStudentsGroupedByTeacher()` returns accurate counts per `teacherId` and excludes unassigned students (`assignedTeacher IS NULL`).
    2. `findByAssignedTeacherUserId(teacherId)` returns only students assigned to `teacherId` with `major`, `demographics.ethnicity`, and `assignedTeacher` initialized (readable after `entityManager.clear()`).
- **Green**:
  - Add `TeacherStudentCountProjection`, `countAssignedStudentsGroupedByTeacher()`, and `@EntityGraph(attributePaths = ["major", "demographics.ethnicity", "assignedTeacher"]) fun findByAssignedTeacherUserId(teacherId: Long): List<StudentEntity>` in `StudentJpaRepository.kt`.
- **Refactor**: Verify JPQL queries execute cleanly on H2.

#### Task B5: `TeacherDtos` & `TeacherService`
- **Red**:
  - Create `TeacherServiceTest.kt` covering:
    1. `getTeachers(keyword, status)`: excludes `DELETED` by default; filters by `status` when provided; filters case-insensitively by `name`, `employeeNumber`, or `college.name`; populates `assignedStudentCount` from `countAssignedStudentsGroupedByTeacher()` with `0` fallback.
    2. `getTeacherDetails(teacherId)`: throws `ResourceNotFoundException` (404) when teacher or user is missing; returns `TeacherDetailDto` with mapped `assignedStudents` (`StudentDto`s) and matching `assignedStudentCount`.
    3. `assignStudents(teacherId, studentIds, assigner)`:
       - Throws `ResourceNotFoundException` if teacher/user missing.
       - Throws `ConflictException` (409) if `teacherUser.status != AccountStatus.ACTIVE` (`PENDING_APPROVAL`, `DISABLED`, `DELETED`).
       - Throws `ResourceNotFoundException` if any `studentId` in deduplicated `studentIds` does not exist.
       - Idempotent no-op when student is already assigned to `teacherId` (`unchangedCount` incremented, student NOT re-saved, NO `StudentAssignedToTeacherEvent` published).
       - Fresh assignment (`assignedTeacher == null`) increments `assignedCount`, sets `assignedTeacher = teacher`, saves, publishes `StudentAssignedToTeacherEvent` (`previousTeacherId = null`).
       - Reassignment (`assignedTeacher.userId != teacherId`) increments `reassignedCount`, sets `assignedTeacher = teacher`, saves, publishes `StudentAssignedToTeacherEvent` (`previousTeacherId = oldId`) to target `teacherId` only.
       - Duplicate IDs in `studentIds` are deduplicated before processing.
    4. `unassignStudent(teacherId, studentId)`:
       - Throws `ResourceNotFoundException` if teacher or student missing.
       - Throws `ConflictException` if student is unassigned or assigned to a different teacher.
       - Clears `student.assignedTeacher = null`, saves student, returns `UnassignStudentResponse(success = true, unassignedStudentId = studentId)`, emits NO notification event.
- **Green**:
  - Create `TeacherDtos.kt` (`TeacherSummaryDto`, `TeacherDetailDto`, `AssignTeacherStudentsRequest` with `@field:NotEmpty`, `AssignTeacherStudentsResponse`, `UnassignStudentResponse` — zero presentation strings).
  - Create `TeacherService.kt` implementing all 4 methods inside `@Transactional` / `@Transactional(readOnly = true)`.
- **Refactor**: Extract shared teacher lookup & summary-building helper in `TeacherService.kt` to avoid duplicating `UserEntity`/`TeacherEntity` join logic.

#### Task B6: `TeacherController` Authorization & Endpoint Contract
- **Red**:
  - Create `TeacherControllerTest.kt` (unit + MockMvc validation tests) verifying:
    1. `SYSTEM_ADMIN` and `HEAD_COUNSELLOR` succeed (`200 OK`) on `GET /api/teachers`, `GET /api/teachers/{teacherId}`, `POST /api/teachers/{teacherId}/students`, `DELETE /api/teachers/{teacherId}/students/{studentId}`.
    2. `null` user and roles `TEACHER`, `STUDENT`, `DOCTOR`, `TRIAL_ADMIN` throw `ForbiddenException` (`403 Forbidden`) on all 4 endpoints.
    3. Empty `studentIds` on `POST /api/teachers/{teacherId}/students` triggers `400 Bad Request` via Bean Validation (`@Valid`).
    4. Propagates `ResourceNotFoundException` (`404`) and `ConflictException` (`409`).
- **Green**:
  - Create `TeacherController.kt` at `@RequestMapping("/api/teachers")` with centralized `requireAuthorizedRole(user)` guard (`SYSTEM_ADMIN`, `HEAD_COUNSELLOR`).
- **Refactor**: Run `./mvnw test` to confirm all backend tests pass.

---

### Part B: Frontend & MSW (Red -> Green -> Refactor)

#### Task F1: Type Contracts, API Client & MSW Mock Parity
- **Red**:
  - In `frontend/src/mocks/handlers.test.ts`, add MSW integration tests for:
    - `GET /api/teachers` returns teachers with `assignedStudentCount` (and `403` for non-admin/non-HC tokens).
    - `GET /api/teachers/:teacherId` returns profile + `assignedStudents` with `assignedTeacherId`/`assignedTeacherName`.
    - `POST /api/teachers/:teacherId/students` assigns/reassigns students, updates `mockStudentsDb` (`assignedTeacherId`/`assignedTeacherName`), returns counts, and returns `409` when target teacher is `PENDING_APPROVAL` or `DISABLED`.
    - `DELETE /api/teachers/:teacherId/students/:studentId` unassigns student (`assignedTeacherId = null`, `assignedTeacherName = null`) and returns `409` if student is not assigned to that teacher.
- **Green**:
  - Update `frontend/src/types/index.ts` (`Student`) and `frontend/src/api/students.ts` (`StudentDto`) with `assignedTeacherId?: number | null` and `assignedTeacherName?: string | null`.
  - Create `frontend/src/api/teachers.ts` (`TeacherSummaryDto`, `TeacherDetailDto`, `AssignTeacherStudentsResponse`, `UnassignStudentResponse`, `fetchTeachers`, `fetchTeacherDetails`, `assignStudentsToTeacher`, `unassignStudentFromTeacher`).
  - Update `frontend/src/mocks/data/students.ts` with `assignedTeacherId` / `assignedTeacherName` aligned to `mockAdminUsersDb` (e.g., assign students `1` and `2` to teacher `2` `'艾米丽·沃森'`, leaving others unassigned).
  - Create `frontend/src/mocks/data/teachers.ts`, export in `frontend/src/mocks/db.ts`, and add `/api/teachers*` handlers in `frontend/src/mocks/handlers.ts` (never masking `4xx` responses on bypass; update `GET /api/students` teacher filter to respect `assignedTeacherId` fallback cleanly).
- **Refactor**: Keep `apiFetch` calls passing plain `body: { studentIds }`.

#### Task F2: Notification Text, View & Activity Navigation Integration
- **Red**:
  - In `frontend/src/utils/notificationText.test.ts`, add test for `STUDENT_ASSIGNED_TEACHER` formatting with `studentName`, `studentNumber`, `assignerName` (and fallback when `assignerName`/`studentNumber` omitted).
  - In `frontend/src/utils/activityNavigation.test.ts`, add test for `STUDENT_ASSIGNED_TEACHER` (`actionType: 'VIEW_STUDENT'`, `actionTargetId: 42`) routing `teacher` to `{ tab: 'Students', entityId: 42, viewStudentId: 42 }`.
  - In `frontend/src/components/notifications/NotificationsView.test.tsx`, add test rendering a `STUDENT_ASSIGNED_TEACHER` notification: asserts title `"学生分配通知"`, icon `"person_add"`, localized body, and clicking `"查看学生"` calls `onViewStudent('42')`.
  - In `frontend/src/pages/TeacherPage.test.tsx`, add test verifying `lastEvent` navigation to `TeacherTabs.STUDENTS` invalidates `['/api/students']` and opens student details.
- **Green**:
  - Update `frontend/src/utils/notificationText.ts` (`case 'STUDENT_ASSIGNED_TEACHER'`).
  - Update `frontend/src/components/notifications/NotificationsView.tsx` (add `STUDENT_ASSIGNED_TEACHER` checks before `.includes('ASSIGNED')`).
  - Update `frontend/src/utils/activityNavigation.ts` (include `messageCode === 'STUDENT_ASSIGNED_TEACHER'` in `isStudentAction`).
  - Update `frontend/src/pages/TeacherPage.tsx` (invalidate `['/api/students']` when `lastEvent` targets `TeacherTabs.STUDENTS`).
- **Refactor**: Verify no hardcoded strings leak outside localized UI formatters.

#### Task F3: `AssignStudentsBottomSheet` Component
- **Red**:
  - Create `frontend/src/components/staff/AssignStudentsBottomSheet.test.tsx` testing:
    1. Fetches `/api/students` with `session.token` and defaults `"仅看未分配"` `<md-filter-chip>` to selected (hiding already-assigned students until toggled to `"全部学生"`).
    2. Search via `<md-outlined-text-field>` filters by `name`, `studentNumber`, and `major` with 300ms debounce.
    3. Students already assigned to *this* teacher have disabled `<md-checkbox>` and `"已分配"` badge.
    4. Multi-selecting unassigned students enables `"确认分配 (N)"` (`PrimaryButton`) and submits `POST /api/teachers/{id}/students`, invalidating `['/api/teachers']`, `['/api/admin/users']`, `['/api/students']`, showing snackbar, and calling `onClose`.
    5. Selecting at least one student assigned to a *different* teacher opens a reassignment confirmation `GenericDialog` listing those students and their current teachers before submitting.
    6. Loading, empty search/filter, and API error states render cleanly.
    7. Strictly uses MD3 Web Components (asserts `container.querySelectorAll('input, textarea, select').length === 0`).
- **Green**:
  - Create `frontend/src/components/staff/AssignStudentsBottomSheet.tsx`.
- **Refactor**: Extract debounced search hook/helper or clean row subcomponent if needed.

#### Task F4: `TeacherCaseloadSection` Shared Component
- **Red**:
  - Create `frontend/src/components/staff/TeacherCaseloadSection.test.tsx` testing:
    1. Fetches `GET /api/teachers/{teacherId}` with `session.token` in `queryKey` and `placeholderData`, rendering `"负责学生 (N)"` and student rows (name, studentNumber, major, risk badge).
    2. Clicking `"分配学生"` calls `openCreation('分配学生', ...)` with `AssignStudentsBottomSheet`.
    3. When `teacherStatus !== 'ACTIVE'` (`PENDING_APPROVAL`, `DISABLED`, `DELETED`), `"分配学生"` button is disabled and inline hint `"仅已启用状态的教师可分配学生"` is shown.
    4. Clicking row unassign button opens `GenericDialog` confirmation; confirming calls `DELETE /api/teachers/{teacherId}/students/{studentId}`, shows snackbar `"已取消学生分配"`, and invalidates `['/api/teachers']`, `['/api/admin/users']`, `['/api/students']`.
    5. Loading, error, and empty caseload states render cleanly.
- **Green**:
  - Create `frontend/src/components/staff/TeacherCaseloadSection.tsx`.
- **Refactor**: Reuse `AvatarBadge` and `RISK_LEVEL_STYLES` / `RISK_LEVEL_LABELS` from existing repo config.

#### Task F5: `StaffManagementView`, `StaffDetailsView`, `HeadCouncillorPage` & `TrialAdminPage` Integration
- **Red**:
  - Create `frontend/src/components/staff/StaffManagementView.test.tsx` testing:
    1. Fetches `/api/teachers` via `fetchTeachers` (loading state, error state with retry, empty state).
    2. Renders real columns (`教师姓名/工号`, `所属学院`, `负责学生数`, `账号状态`) with `assignedStudentCount` and `collegeName`.
    3. Search and status filtering + row click `onStaffSelect`.
  - Create `frontend/src/components/staff/StaffDetailsView.test.tsx` testing:
    1. Renders real teacher metadata (`employeeNumber`, `collegeName`, `phone`, `email`, `status`) and `TeacherCaseloadSection`.
    2. Asserts removed legacy mock UI (`操作日志`, `权限范围`, `暂停访问`, `重置登录凭据`) is NOT rendered.
- **Green**:
  - Rewrite `frontend/src/components/staff/StaffManagementView.tsx` to query `fetchTeachers(session?.token)` and use `TeacherSummaryDto`.
  - Rewrite `frontend/src/components/staff/StaffDetailsView.tsx` to render real profile metadata + `TeacherCaseloadSection` (keeping `STAFF_DETAILS_TABS = []` exported for `HeadCouncillorPage`, `TrialAdminPage`, and `DoctorPage` compatibility).
  - Update `frontend/src/pages/HeadCouncillorPage.tsx` and `frontend/src/pages/TrialAdminPage.tsx` `DetailsPanel` title/subtitle expressions to support `TeacherSummaryDto` (`employeeNumber`, `collegeName`).
- **Refactor**: Remove unused `Counselor` mock type and unused mock state.

#### Task F6: `UserDetailsView` (Admin Teacher Caseload) & `StudentsView` (`导师` Filter Chip)
- **Red**:
  - Update `frontend/src/components/admin/UserDetailsView.test.tsx` (wrap with `SnackbarProvider` and `CreationOverlayProvider`, mock `/api/teachers/:id`) and add tests:
    1. When `user.role === 'TEACHER'`, renders `TeacherCaseloadSection` (`"负责学生"`), and disables `"分配学生"` when `user.status !== 'ACTIVE'`.
    2. When `user.role === 'DOCTOR'` or `'SYSTEM_ADMIN'`, does NOT render `TeacherCaseloadSection`.
  - Update `frontend/src/components/admin/AdminUserManagementDetails.test.tsx` to verify teacher `id: 201` renders `"负责学生"` section alongside `UserGovernanceFooter` (`禁用账号`, `注销账号`).
  - Update `frontend/src/components/students/StudentsView.test.tsx` to test that `'导师'` filter chip dynamically lists unique `assignedTeacherName` values from loaded students and filters the table when an option is clicked.
- **Green**:
  - Update `frontend/src/components/admin/UserDetailsView.tsx` to render `TeacherCaseloadSection` when `user.role === 'TEACHER'`.
  - Update `frontend/src/components/students/StudentsView.tsx` to compute `'导师'` chip options from `students.map((s) => s.assignedTeacherName).filter(Boolean)` and filter `filteredStudents` by `activeFilters['导师']`.
- **Refactor**: Ensure defensive null/empty fallbacks everywhere.

---

## 4. Verification Commands (Phase 6)

```bash
# Backend unit & H2 integration tests
cd backend && ./mvnw test

# Frontend unit & component tests
cd frontend && npm run test

# Frontend TypeScript strict type check
cd frontend && npm run lint

# Frontend production bundle build
cd frontend && npm run build
```
