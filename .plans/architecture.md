# Architecture & Domain Design: Assign Students to Teacher Workflow

**Status**: Synthesized from Phase 1 System Architecture & DDD Consultation  
**Source Intent**: [intent-lock.md](file:///Volumes/Files/Programming/medical-system/.plans/intent-lock.md)

---

## 1. Bounded Contexts & Aggregate Design

1. **Identity & Access Management (`User` / `AccountStatus`)**
   - `UserEntity` is the aggregate root owning identity (`id`, `name`, `email`, `phone`, `role`, `status: AccountStatus`).
   - Role extensions (`TeacherEntity` with `@Id userId`, `employeeNumber`, `college`) map 1:1 to `UserEntity` via shared primary key (`user_id`).
   - **Invariant**: `TeacherEntity` does not duplicate account lifecycle status; `ACTIVE` status is enforced by reading `UserEntity.status == AccountStatus.ACTIVE`.

2. **Academic & Student Context (`Student` & `Teacher`)**
   - **`Student` Aggregate Root**: Owns `assignedTeacherId: Long?` (`StudentEntity.assignedTeacher: TeacherEntity?`).
   - **`Teacher` Aggregate Boundary**: Remains lightweight (`userId`, `employeeNumber`, `collegeId`) and MUST NOT hold a mutable `students` collection. A teacher's caseload (`assignedStudents`) is strictly a **read-model query projection** (`TeacherDetailDto`), avoiding transactional contention and large-graph rehydration.
   - **Application Service (`TeacherService`)**: Coordinates multi-student assignment (`assignStudents`) and single-student unassignment (`unassignStudent`) inside `@Transactional` boundaries, enforcing invariants before persisting `StudentEntity` changes and emitting domain events.

3. **Notification Context (`DomainEvent` -> `AFTER_COMMIT`)**
   - Assignment emits `StudentAssignedToTeacherEvent` via `DomainEventPublisher` (matching `AssessmentEventListener` / `NotificationEventListener`).
   - Listener (`NotificationEventListener` or `TeacherAssignmentEventListener` with `@Transactional(propagation = Propagation.REQUIRES_NEW)` and `@Async @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)`) persists one `Notification` per newly assigned/reassigned student only after the assignment transaction commits.
   - **Language-Agnostic Backend**: Backend persists `messageCode = STUDENT_ASSIGNED_TEACHER(35)`, `actionType = VIEW_STUDENT`, `actionTargetId = studentId`, and structured `payload` (`studentId`, `studentName`, `studentNumber`, `assignerName`) — zero presentation strings in DTOs or notifications.

---

## 2. Backend Technical Design & API Contracts

### 2.1 Domain Event & Notification Enums
- **`StudentAssignedToTeacherEvent`** (`com.medicalsystem.backend.event.StudentAssignedToTeacherEvent`):
  ```kotlin
  data class StudentAssignedToTeacherEvent(
      val studentId: Long,
      val studentName: String,
      val studentNumber: String,
      val teacherId: Long,
      val previousTeacherId: Long? = null,
      val assignerName: String,
      override val occurredOn: LocalDateTime = LocalDateTime.now()
  ) : DomainEvent
  ```
- **`NotificationMessageCode`** (`com.medicalsystem.backend.model.NotificationMessageCode`):
  - Add `STUDENT_ASSIGNED_TEACHER(35)` after `ASSESSMENT_HIGH_RISK_ALERT_TEACHER(34)`.
  - `NotificationActionType.VIEW_STUDENT(11)` already exists.
- **`NotificationEventListener`** (or `TeacherAssignmentEventListener`):
  - `@Async @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` handles `StudentAssignedToTeacherEvent`:
    - Calls `notificationService.saveNotification(Notification(userId = event.teacherId, messageCode = NotificationMessageCode.STUDENT_ASSIGNED_TEACHER, payload = mapOf("studentId" to event.studentId.toString(), "studentName" to event.studentName, "studentNumber" to event.studentNumber, "assignerName" to event.assignerName), actionType = NotificationActionType.VIEW_STUDENT, actionTargetId = event.studentId, isActionAvailable = true))`.

### 2.2 DTO Contracts (`com.medicalsystem.backend.dto`)
- **`TeacherSummaryDto`**:
  - `id: Long`, `name: String`, `employeeNumber: String`, `collegeId: Long`, `collegeName: String`, `status: AccountStatus`, `phone: String?`, `email: String`, `assignedStudentCount: Int`
- **`TeacherDetailDto`**:
  - `id: Long`, `name: String`, `employeeNumber: String`, `collegeId: Long`, `collegeName: String`, `status: AccountStatus`, `phone: String?`, `email: String`, `assignedStudentCount: Int`, `assignedStudents: List<StudentDto>`
- **`AssignTeacherStudentsRequest`**:
  - `@field:NotEmpty(message = "studentIds must not be empty") val studentIds: List<Long>`
- **`AssignTeacherStudentsResponse`** (no presentation message string):
  - `assignedCount: Int`, `reassignedCount: Int`, `unchangedCount: Int`, `assignedStudentIds: List<Long>`
- **`UnassignStudentResponse`**:
  - `success: Boolean = true`, `unassignedStudentId: Long`
- **`StudentDto` Enrichment**:
  - Add `val assignedTeacherId: Long? = null` and `val assignedTeacherName: String? = null`.

### 2.3 Controller & Endpoints (`com.medicalsystem.backend.controller.TeacherController`)
`@RestController @RequestMapping("/api/teachers")`
- **Authorization Guard**: Every endpoint verifies `@CurrentUser user: User?` is non-null (`403 ForbiddenException` or `401`) and `user.role == UserRole.SYSTEM_ADMIN || user.role == UserRole.HEAD_COUNSELLOR` (else `403 ForbiddenException`).
- **`GET /api/teachers`** (`?keyword=&status=` optional):
  - Returns `List<TeacherSummaryDto>`.
  - Joins/batch-loads `TeacherEntity`, `UserEntity`, `CollegeEntity` + single `GROUP BY` count query in `StudentJpaRepository` (`countAssignedStudentsGroupedByTeacher`) to eliminate $N+1$ queries.
  - Filters out `AccountStatus.DELETED` by default unless explicitly requested, or supports `?status=` filtering + case-insensitive `keyword` matching (`name`, `employeeNumber`, `college.name`).
- **`GET /api/teachers/{teacherId}`**:
  - Returns `TeacherDetailDto` (`404 ResourceNotFoundException` if teacher/user missing).
  - Fetches assigned students with `@EntityGraph(attributePaths = ["major", "demographics.ethnicity"])` (`findByAssignedTeacherUserId(teacherId)`) and maps to `List<StudentDto>`.
- **`POST /api/teachers/{teacherId}/students`**:
  - Request: `@Valid @RequestBody request: AssignTeacherStudentsRequest`.
  - Guards:
    1. Teacher & User exist (`404 ResourceNotFoundException`).
    2. `teacherUser.status == AccountStatus.ACTIVE` (else `409 ConflictException("Target teacher account is not active")`).
    3. Deduplicate `request.studentIds`; all requested students must exist (`404 ResourceNotFoundException`).
  - Execution:
    - If `student.assignedTeacher?.userId == teacherId`: increment `unchangedCount`, do NOT save or emit event.
    - Otherwise: record `previousTeacherId = student.assignedTeacher?.userId`; if `null` increment `assignedCount`, else increment `reassignedCount`; set `student.assignedTeacher = teacherEntity`; collect `studentId` into `assignedStudentIds` and publish `StudentAssignedToTeacherEvent`.
  - Returns `200 OK` with `AssignTeacherStudentsResponse`.
- **`DELETE /api/teachers/{teacherId}/students/{studentId}`**:
  - Guards:
    1. Teacher exists (`404 ResourceNotFoundException`).
    2. Student exists (`404 ResourceNotFoundException`).
    3. `student.assignedTeacher?.userId == teacherId` (else `409 ConflictException`).
  - Sets `student.assignedTeacher = null`, saves student, returns `200 OK` with `UnassignStudentResponse(success = true, unassignedStudentId = studentId)`. No notification emitted.

### 2.4 Persistence & N+1 Avoidance
- **`StudentJpaRepository`**:
  - Add `interface TeacherStudentCountProjection { fun getTeacherId(): Long; fun getStudentCount(): Long }` and `@Query("SELECT s.assignedTeacher.userId AS teacherId, COUNT(s) AS studentCount FROM StudentEntity s WHERE s.assignedTeacher IS NOT NULL GROUP BY s.assignedTeacher.userId") fun countAssignedStudentsGroupedByTeacher(): List<TeacherStudentCountProjection>`.
  - Add `@EntityGraph(attributePaths = ["major", "demographics.ethnicity", "assignedTeacher"]) fun findByAssignedTeacherUserId(teacherId: Long): List<StudentEntity>`.
- **`StudentMapper` & `StudentService`**:
  - `StudentMapper` populates `assignedTeacherId = model.assignedTeacherId` and `assignedTeacherName`.
  - To avoid $N+1$ lookups on `GET /api/students`, add `toDto(model: Student, teacherNameLookup: Map<Long, String>?)` or batch-load teacher names in `StudentService.fetchAllStudents` via `userJpaRepository.findAllById(teacherIds)` while keeping single-item `toDto(model)` backward compatible for callers/tests.
- **`StudentImportService.updateExistingStudent` Bug Fix**:
  - Only update `existingStudent.assignedTeacher` when `!row.teacherEmployeeNumber.isNullOrBlank()`. When omitted/blank in CSV, preserve `existingStudent.assignedTeacher`.

---

## 3. Frontend Architecture & UI Design

### 3.1 Strict Conventions & Caching Rules
- **MD3 Web Components Only**: Zero native `<input>`, `<textarea>`, or `<select>` elements. Use `<md-outlined-text-field>`, `<md-checkbox>`, `<md-filter-chip>`, `PrimaryButton`, `SecondaryButton`, `GenericDialog`, `FilterChipSet`.
- **`apiFetch` Body Rule**: Pass plain object `body: { studentIds }` to `apiFetch` (it calls `JSON.stringify` automatically).
- **Auth & Cache Rules**:
  - Every `useQuery` includes `session?.token` in `queryKey`.
  - Detail views use `placeholderData`, NEVER `initialData`.
  - All interfaces strictly typed with zero `any`.
  - Mutations (`assignStudentsToTeacher`, `unassignStudentFromTeacher`) invalidate:
    - `['/api/teachers']`
    - `['/api/admin/users']`
    - `['/api/students']`

### 3.2 API Client (`frontend/src/api/teachers.ts` & `frontend/src/api/students.ts` / `types/index.ts`)
- Add `assignedTeacherId?: number | null` and `assignedTeacherName?: string | null` to `StudentDto` (`src/api/students.ts`) and `Student` (`src/types/index.ts`).
- Create `frontend/src/api/teachers.ts` with `TeacherSummaryDto`, `TeacherDetailDto`, `AssignTeacherStudentsResponse`, `UnassignStudentResponse`, and functions `fetchTeachers`, `fetchTeacherDetails`, `assignStudentsToTeacher`, `unassignStudentFromTeacher`.

### 3.3 Shared UI Components
1. **`TeacherCaseloadSection.tsx`** (`frontend/src/components/staff/TeacherCaseloadSection.tsx`)
   - Props: `teacherId: number`, `teacherName: string`, `teacherStatus?: AccountStatus`, `placeholderSummary?: TeacherSummaryDto`, `onTeacherClickAssignDisabledReason?: string`.
   - Fetches `fetchTeacherDetails(teacherId, session?.token)` with `queryKey: ['/api/teachers', teacherId, session?.token]`, `placeholderData: ...`.
   - Header: `"负责学生 (${count})"` + `SecondaryButton`/`PrimaryButton` `"分配学生"` (disabled when `status !== 'ACTIVE'`, with inline status hint `"仅已启用状态的教师可分配学生"`).
   - Clicking `"分配学生"` invokes `openCreation('分配学生', <AssignStudentsBottomSheet teacher={teacherDetailOrSummary} onSuccess={...} onClose={closeCreation} />)`.
   - Renders assigned student rows (Avatar, name, studentNumber, major, risk badge) + per-row unassign icon/button (`person_remove`).
   - Clicking unassign opens `GenericDialog` confirmation -> calls `unassignStudentFromTeacher`, shows snackbar `"已取消学生分配"`, invalidates queries.
   - Clean loading, error, and empty states.

2. **`AssignStudentsBottomSheet.tsx`** (`frontend/src/components/staff/AssignStudentsBottomSheet.tsx`)
   - Rendered inside `CreationOverlayProvider` bottom sheet (`STANDARD` bottom sheet, expandable to `FULLSCREEN`).
   - Fetches students via `useQuery(['/api/students', session?.token], () => fetchStudents(session?.token))`.
   - Search & Filters:
     - `<md-outlined-text-field>` with 300ms debounced search matching `name`, `studentNumber`, `major`.
     - `<md-filter-chip>` toggle: `"仅看未分配"` (selected `true` by default) / `"全部学生"`.
   - List rows:
     - `<md-checkbox>` multi-select (students already assigned to *this* `teacher.id` are disabled and badged `"已分配"`).
     - Shows student name, `studentNumber`, `major`, risk badge, and current teacher badge (`"当前导师: ${s.assignedTeacherName}"` or `"未分配"`).
   - Loading / empty / error states.
   - Footer action bar with selected count + `SecondaryButton` `"取消"` + `PrimaryButton` `"确认分配 (${selectedIds.length})"`.
   - **Reassignment Confirmation**: If any selected student has `assignedTeacherId != null && assignedTeacherId !== teacher.id`, opens a `GenericDialog` listing those students and their current teachers before calling `assignStudentsToTeacher`.
   - On success: invalidates `['/api/teachers']`, `['/api/admin/users']`, `['/api/students']`, shows snackbar (`"成功分配 N 名学生"`), and closes bottom sheet.

### 3.4 Page & View Integrations
- **`StaffManagementView.tsx`** & **`HeadCouncillorPage.tsx`**:
  - Replace hardcoded `counselors` array with `useQuery(['/api/teachers', session?.token], () => fetchTeachers(session?.token))`.
  - Render real columns (`教师姓名/工号`, `所属学院`, `账号状态`, `负责学生数`), search/status filtering, loading/error/empty states.
- **`StaffDetailsView.tsx`**:
  - Replace mock tabs (`audit`, `scopes`) and no-op footer buttons (`暂停访问`, `重置登录凭据`) with real teacher profile info (`工号`, `所属学院`, `联系电话`, `电子邮箱`, `账号状态`) + `TeacherCaseloadSection`.
- **`UserDetailsView.tsx`**:
  - When `user.role === 'TEACHER'`, render `TeacherCaseloadSection` (`teacherId={user.id}`, `teacherName={user.name}`, `teacherStatus={user.status}`) below the contact/affiliation `DetailsSection`s, keeping `UserGovernanceFooter` solely for account lifecycle actions.
- **`StudentsView.tsx`**:
  - Populate `'导师'` filter chip dynamically from `students.map(s => s.assignedTeacherName).filter(Boolean)` and filter `filteredStudents` when `activeFilters['导师']` is selected.

### 3.5 Teacher Notification & Navigation Integration
- **`frontend/src/utils/notificationText.ts`**: Add `STUDENT_ASSIGNED_TEACHER` message formatter using `studentName`, `studentNumber`, `assignerName`.
- **`frontend/src/components/notifications/NotificationsView.tsx`**: Map `STUDENT_ASSIGNED_TEACHER` title (`"学生分配通知"`) and icon (`"person_add"`). `actionType === 'VIEW_STUDENT'` renders `"查看学生"` -> calls `onViewStudent(String(actionTargetId))`.
- **`frontend/src/utils/activityMapper.ts` & `activityNavigation.ts`**: Map `STUDENT_ASSIGNED_TEACHER` / `VIEW_STUDENT` to `{ tab: 'Students', entityId }` so Teacher clicking notification or dashboard activity opens `TeacherTabs.STUDENTS` with that student selected.
- **`TeacherPage.tsx`**: Ensure `lastEvent` navigation to `TeacherTabs.STUDENTS` invalidates `['/api/students']` or fetches `/api/students/${lastEvent.entityId}` cleanly so newly assigned students appear immediately in the list and details panel.

### 3.6 MSW Mock Parity
- Create `frontend/src/mocks/data/teachers.ts` backed by `mockUsersDb` / `mockStudentsDb` (consistent IDs with `admin.ts` & `students.ts`).
- Update `frontend/src/mocks/data/students.ts` with `assignedTeacherId` & `assignedTeacherName`.
- Add `/api/teachers`, `/api/teachers/:teacherId`, `/api/teachers/:teacherId/students`, `/api/teachers/:teacherId/students/:studentId` handlers in `frontend/src/mocks/handlers.ts` (enforcing `401`/`403` role check and `409` non-`ACTIVE` teacher check without masking `4xx` errors).
