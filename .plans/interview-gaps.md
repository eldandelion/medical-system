# Interview Knowledge Gap Tracker: Assign Student to Teacher

## Blueprint Sections
1. High-Level Scope & Head Counselor Teacher Visibility
2. Assignment Rules, Reassignment & Unassignment Behavior
3. Frontend UI/UX & Bottom Sheet Interaction
4. Backend API, Domain Events & Teacher Notifications
5. Edge Cases, Permissions & Out-of-Scope Boundaries

---

## Gaps to Resolve

### Section 1: High-Level Scope & Head Counselor Teacher Visibility
- [x] **Gap 1.1 (Head Counselor Teacher Source)**: Resolved — Add real backend `/api/teachers` endpoints accessible to both `HEAD_COUNSELLOR` and `SYSTEM_ADMIN`, and wire `StaffManagementView` & `StaffDetailsView` to real teacher and caseload data.
- [x] **Gap 1.2 (Unified vs Separate Teacher Details Views)**: Resolved — Both `UserDetailsView` (for `TEACHER` role) and `StaffDetailsView` will share the same `/api/teachers/{id}` caseload data / reusable Assign Student bottom sheet component.

### Section 2: Assignment Rules, Reassignment & Unassignment Behavior
- [x] **Gap 2.1 (Batch vs Single Assignment)**: Resolved — Multi-select checkboxes so Admin / Head Counselor can select and assign one or multiple students at once.
- [x] **Gap 2.2 (Reassignment of Already-Assigned Students)**: Resolved — Allow reassignment: display current teacher badge in the search list, and ask confirmation before overwriting if any selected student already has another teacher.
- [x] **Gap 2.3 (Unassignment)**: Resolved — Allow unassigning a student from the Teacher Details caseload list (with confirmation).
- [x] **Gap 2.4 (Teacher Account Status Guard)**: Resolved — Restrict assigning students to `ACTIVE` teachers only (block `PENDING`/`DISABLED`/`DELETED`).

### Section 3: Frontend UI/UX & Bottom Sheet Interaction
- [x] **Gap 3.1 (Button Placement)**: Resolved — Inline `"分配学生"` button inside a shared `"负责学生"` section in both `UserDetailsView` (for `TEACHER`) and `StaffDetailsView`, opening the `CreationOverlayProvider` bottom sheet (`UserGovernanceFooter` stays strictly for account status actions).
- [x] **Gap 3.2 (Teacher Details Caseload Visibility)**: Resolved — Both `UserDetailsView` (when `role === 'TEACHER'`) and `StaffDetailsView` render the shared `"负责学生"` caseload list and refresh live on assign/unassign.
- [x] **Gap 3.3 (Bottom Sheet Search & Filtering)**: Resolved — `CreationOverlayProvider` bottom sheet with `<md-outlined-text-field>` search (300ms debounce, name/studentNumber/major), `"仅看未分配"` chip ON by default (toggleable to `"全部学生"`), `<md-checkbox>` multi-select, current-teacher badge, and students already assigned to this teacher disabled as `"已分配"`.
- [x] **Gap 3.4 (MD3 UI Constraints)**: Resolved — Strictly MD3 web components (`<md-outlined-text-field>`, `<md-checkbox>`, `<md-filter-chip>`, `PrimaryButton`/`SecondaryButton`), snackbar feedback, loading/empty/error states.

### Section 4: Backend API, Domain Events & Teacher Notifications
- [x] **Gap 4.1 (API Contract & Teacher/Student DTOs)**: Resolved — Add `TeacherController` (`GET /api/teachers`, `GET /api/teachers/{id}`, `POST /api/teachers/{id}/students`, `DELETE /api/teachers/{id}/students/{studentId}`) for `SYSTEM_ADMIN` & `HEAD_COUNSELLOR`, and add nullable `assignedTeacherId` / `assignedTeacherName` to `StudentDto`.
- [x] **Gap 4.2 (Teacher Notification Behavior)**: Resolved — Target teacher receives notification (`STUDENT_ASSIGNED_TEACHER`, `NotificationActionType.VIEW_STUDENT`, `actionTargetId = studentId`) so clicking opens that student in Teacher's student list; no notification to student or previous teacher.
- [x] **Gap 4.3 (One Notification per Assignment vs Batch)**: Resolved — One notification per newly assigned student (`VIEW_STUDENT` -> `studentId`).

### Section 5: Edge Cases, Permissions & Out-of-Scope Boundaries
- [x] **Gap 5.1 (Existing CSV Silent Unassign Bug & Filter Chip)**: Resolved — Fix `StudentImportService.updateExistingStudent` to preserve existing `assignedTeacher` when CSV teacher column is blank, and wire `StudentsView`'s `'导师'` filter chip to `StudentDto.assignedTeacherName`.
- [x] **Gap 5.2 (StaffDetailsView Legacy Mock Tabs & MSW Parity)**: Resolved — `StaffDetailsView` shows real teacher profile details (工号/学院/联系方式) + real `"负责学生"` caseload with `"分配学生"` / unassign actions, removing fake hardcoded `audit`/`scopes` mock tabs and no-op footer buttons; MSW mocks synced for all `/api/teachers` endpoints and `StudentDto.assignedTeacher*`.
