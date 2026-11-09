# Implementation Plan: Remove 高危名单 (Notification-Driven High-Risk Workflow)

## Overview
This plan implements the complete elimination of the 高危名单 (High-Risk Roster) page and transitions high-risk handling into an alert- and notification-driven workflow.
When `ClinicalRiskEvaluator` detects a `HIGH` risk screening result, it serves as the sole alert authority, notifying both Head Councillors (`ASSESSMENT_HIGH_RISK_ALERT_HC`) and the student's assigned teacher (`ASSESSMENT_HIGH_RISK_ALERT_TEACHER`) with action type `VIEW_STUDENT`.
High-risk notifications render two actionable options:
1. `发起转诊` (Initiate Referral) pre-filled with the student's clinical details, dynamically hidden if the student already has an open referral.
2. `查看学生` (View Student) routing directly to the student profile in 学生管理.
Auto-referral generation on HIGH risk and the legacy heuristic >80% score HC alert are eliminated.

---

## Strict Writable Files Boundary

The execution agent MUST operate strictly within this whitelist. No other files may be modified, created, or deleted.

### 1. Modified Files (24)
- `backend/src/main/kotlin/com/medicalsystem/backend/model/NotificationMessageCode.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/model/NotificationActionType.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralJpaRepository.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepository.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapter.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/NotificationDto.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/NotificationService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/NotificationController.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/ClinicalRiskEvaluator.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/event/StudentHealthProfileRiskListener.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEventListener.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/StudentController.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/ClinicalRiskEvaluatorTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/event/StudentHealthProfileRiskListenerTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentServiceTest.kt`
- `frontend/src/api/notifications.ts`
- `frontend/src/components/notifications/NotificationsView.tsx`
- `frontend/src/pages/HeadCouncillorPage.tsx`
- `frontend/src/pages/TeacherPage.tsx`
- `frontend/src/components/assessments/AssessmentFlow.tsx`
- `frontend/src/components/records/ReferralCreationForm.tsx`
- `frontend/src/components/notifications/NotificationsView.test.tsx`

### 2. Created Files (6)
- `backend/src/test/kotlin/com/medicalsystem/backend/model/NotificationEnumsTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapterTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/NotificationServiceTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentEventListenerTest.kt`
- `frontend/src/pages/HeadCouncillorPage.test.tsx`
- `frontend/src/pages/TeacherPage.test.tsx`

### 3. Deleted Files (3)
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/HighRiskStudentDto.kt`
- `frontend/src/api/highRisk.ts`
- `frontend/src/components/records/HighRiskListView.tsx`

Total Files Impacted: 33 files.

---

## Implementation Roadmap (Strict TDD Workflow)

### Phase 1: Domain Enums & Model Extensions (TDD)
1. **Write failing unit test for enums and terminal status**
   - File: `backend/src/test/kotlin/com/medicalsystem/backend/model/NotificationEnumsTest.kt` (New)
   - Action: Assert:
     - `NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER.code == 34`
     - `NotificationActionType.VIEW_STUDENT.code == 11`
     - `ReferralStatus.TERMINAL_STATUSES == setOf(ReferralStatus.REJECTED, ReferralStatus.CLOSED, ReferralStatus.ERROR)`
     - `ReferralStatus.isTerminal` returns `true` for `REJECTED`, `CLOSED`, `ERROR`; and `false` for `DRAFT`, `AWAITING_APPROVAL`, `AWAITING_TRIAGE`, `WAITING_FOR_SCHEDULING`, `WAITING_FOR_APPOINTMENT`, `AWAITING_FEEDBACK_APPROVAL`, `NEEDS_REASSIGNMENT`, `RECALLED`.
   - Dependency: None
   - Risk: Low

2. **Extend domain enums**
   - Files:
     - `backend/src/main/kotlin/com/medicalsystem/backend/model/NotificationMessageCode.kt`
     - `backend/src/main/kotlin/com/medicalsystem/backend/model/NotificationActionType.kt`
     - `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralStatus.kt`
   - Action:
     - `NotificationMessageCode`: append `ASSESSMENT_HIGH_RISK_ALERT_TEACHER(34)`
     - `NotificationActionType`: append `VIEW_STUDENT(11)`
     - `ReferralStatus`: add `val isTerminal: Boolean get() = this in TERMINAL_STATUSES` and `companion object { val TERMINAL_STATUSES = setOf(REJECTED, CLOSED, ERROR) }`
   - Dependency: Step 1
   - Verification: `NotificationEnumsTest` passes.

---

### Phase 2: Persistence & Open Referral Batched Query (TDD)
3. **Write failing integration test for open referral query**
   - File: `backend/src/test/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapterTest.kt` (New)
   - Action: Integration test with `@SpringBootTest` & `@Transactional`:
     - Test `findStudentIdsWithOpenReferral` with empty collection returns `emptySet()`.
     - Seed referrals:
       - Student 101 with `DRAFT` referral -> included in result.
       - Student 102 with `AWAITING_APPROVAL` referral -> included in result.
       - Student 103 with `RECALLED` referral -> included in result.
       - Student 104 with `REJECTED` and `CLOSED` referrals only -> NOT in result.
       - Student 105 with no referrals -> NOT in result.
     - Call `findStudentIdsWithOpenReferral(listOf(101L, 102L, 103L, 104L, 105L))` -> asserts `setOf(101L, 102L, 103L)`.
   - Dependency: Step 2
   - Risk: Medium (verify JPQL/SQL syntax matches `ReferralEntity.studentId` column).

4. **Implement open referral repository query**
   - Files:
     - `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralJpaRepository.kt`
     - `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepository.kt`
     - `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapter.kt`
   - Action:
     - In `ReferralJpaRepository`:
       ```kotlin
       @org.springframework.data.jpa.repository.Query("SELECT DISTINCT r.studentId FROM ReferralEntity r WHERE r.studentId IN :studentIds AND r.status NOT IN :terminalStatuses")
       fun findStudentIdsWithOpenReferral(
           @org.springframework.data.repository.query.Param("studentIds") studentIds: Collection<Long>,
           @org.springframework.data.repository.query.Param("terminalStatuses") terminalStatuses: Collection<com.medicalsystem.backend.model.ReferralStatus>
       ): Set<Long>
       ```
     - In `ReferralRepository`: declare `fun findStudentIdsWithOpenReferral(studentIds: Collection<Long>): Set<Long>`
     - In `ReferralRepositoryAdapter`:
       ```kotlin
       override fun findStudentIdsWithOpenReferral(studentIds: Collection<Long>): Set<Long> {
           if (studentIds.isEmpty()) return emptySet()
           return jpaRepository.findStudentIdsWithOpenReferral(studentIds, com.medicalsystem.backend.model.ReferralStatus.TERMINAL_STATUSES)
       }
       ```
   - Dependency: Step 3
   - Verification: `ReferralRepositoryAdapterTest` passes.

---

### Phase 3: Notification DTO & Read-Path Duplicate Guard (TDD)
5. **Write failing unit test for `NotificationService.getNotificationDtosForUser`**
   - File: `backend/src/test/kotlin/com/medicalsystem/backend/service/NotificationServiceTest.kt` (New)
   - Action: Unit test with `@ExtendWith(MockitoExtension::class)`:
     - Mock `notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)`.
     - Test non-high-risk notification (e.g. `REFERRAL_SUBMITTED_INITIATOR`): `canCreateReferral` is `null`.
     - Test `ASSESSMENT_HIGH_RISK_ALERT_HC` for student 201:
       - When `referralRepository.findStudentIdsWithOpenReferral` returns `emptySet()` -> `canCreateReferral` is `true`.
       - When `referralRepository.findStudentIdsWithOpenReferral` returns `setOf(201L)` -> `canCreateReferral` is `false`.
     - Test `ASSESSMENT_HIGH_RISK_ALERT_TEACHER` for student 202:
       - When student 202 has open referral -> `canCreateReferral` is `false`.
     - Assert that `referralRepository.findStudentIdsWithOpenReferral` is called exactly once with deduplicated student IDs.
   - Dependency: Step 4
   - Risk: Low

6. **Update NotificationDto and NotificationService read path**
   - Files:
     - `backend/src/main/kotlin/com/medicalsystem/backend/dto/NotificationDto.kt`
     - `backend/src/main/kotlin/com/medicalsystem/backend/service/NotificationService.kt`
     - `backend/src/main/kotlin/com/medicalsystem/backend/controller/NotificationController.kt`
   - Action:
     - In `NotificationDto`: append `val canCreateReferral: Boolean? = null`.
     - In `NotificationService`: inject `referralRepository: ReferralRepository` and add:
       ```kotlin
       fun getNotificationDtosForUser(userId: Long): List<NotificationDto> {
           val notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
           val highRiskStudentIds = notifications
               .filter { it.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_HC || it.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER }
               .mapNotNull { it.actionTargetId }
               .toSet()
           val studentIdsWithOpenReferral = if (highRiskStudentIds.isNotEmpty()) {
               referralRepository.findStudentIdsWithOpenReferral(highRiskStudentIds)
           } else {
               emptySet()
           }
           return notifications.map { notif ->
               val canCreateReferral = if (notif.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_HC || notif.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER) {
                   notif.actionTargetId?.let { studentId -> studentId !in studentIdsWithOpenReferral } ?: true
               } else {
                   null
               }
               NotificationDto(
                   id = notif.id!!,
                   userId = notif.userId,
                   messageCode = notif.messageCode.name,
                   payload = notif.payload,
                   isRead = notif.isRead,
                   createdAt = notif.createdAt,
                   actionType = notif.actionType.name,
                   actionTargetId = notif.actionTargetId,
                   isActionAvailable = notif.isActionAvailable,
                   canCreateReferral = canCreateReferral
               )
           }
       }
       ```
     - In `NotificationController.getNotifications`: delegate to `notificationService.getNotificationDtosForUser(user.id)`.
   - Dependency: Step 5
   - Verification: `NotificationServiceTest` passes.

---

### Phase 4: ClinicalRiskEvaluator & Event Listeners Refactoring (TDD)
7. **Update and add tests in `ClinicalRiskEvaluatorTest`**
   - File: `backend/src/test/kotlin/com/medicalsystem/backend/service/ClinicalRiskEvaluatorTest.kt`
   - Action:
     - In `testAcuteSuicidalIdeation_AlertsHeadCouncillor`: verify `actionType == NotificationActionType.VIEW_STUDENT`.
     - Add test `testAcuteSuicidalIdeation_AlertsAssignedTeacher`:
       - Create teacher user + `TeacherEntity`, assign to `StudentEntity.assignedTeacher`.
       - Run evaluation -> verify `notificationRepository.findByUserIdOrderByCreatedAtDesc(teacherUser.id)` contains `NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER` with `actionType = NotificationActionType.VIEW_STUDENT` and identical payload keys.
     - Add test `testHighRisk_WhenTeacherUnassigned_SkipsTeacherNotificationWithoutError`.
   - Dependency: Step 2
   - Risk: Low

8. **Refactor `ClinicalRiskEvaluator`**
   - File: `backend/src/main/kotlin/com/medicalsystem/backend/service/ClinicalRiskEvaluator.kt`
   - Action:
     - In `evaluateRisk` when `evaluatedRisk == RiskStatus.HIGH`:
       - Change HC notification `actionType` from `NotificationActionType.VIEW_RECORDS` to `NotificationActionType.VIEW_STUDENT`.
       - Add notification for assigned teacher:
         ```kotlin
         val teacherUserId = student?.assignedTeacher?.userId
         if (teacherUserId != null) {
             try {
                 notificationService.createNotification(
                     userId = teacherUserId,
                     messageCode = NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER,
                     payload = payload,
                     actionType = NotificationActionType.VIEW_STUDENT,
                     actionTargetId = studentId
                 )
                 notifiedCount++
             } catch (e: Exception) {
                 logger.error("Failed to notify Teacher $teacherUserId: ${e.message}")
             }
         }
         if (notifiedCount == 0) {
             logger.error("No recipient notified for high-risk alert for student $studentId")
         }
         ```
       - Update stale comment at line 144 to reflect that `StudentRiskStatusChangedEvent` no longer creates auto-referrals.
   - Dependency: Step 7
   - Verification: `ClinicalRiskEvaluatorTest` passes.

9. **Write failing test for `AssessmentEventListener` (Single Alert Source)**
   - File: `backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentEventListenerTest.kt` (New)
   - Action:
     - Test `handleAssessmentAssigned` saves `ASSESSMENT_ASSIGNED_STUDENT`.
     - Test `handleAssessmentCompleted`:
       - Given student with assigned teacher and tests scoring >80% of max score:
       - Asserts `ASSESSMENT_COMPLETED_TEACHER` is saved for the teacher without `isHighRisk` or `level` heuristic keys.
       - Asserts NO notification is created for Head Counsellor (verifying single alert source in `ClinicalRiskEvaluator`).
   - Dependency: Step 8
   - Risk: Low

10. **Refactor `AssessmentEventListener`**
    - File: `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEventListener.kt`
    - Action:
      - Remove `headCounsellorRepository: HeadCounsellorRepository` constructor dependency.
      - Remove `// 2. High risk alert for Head Counsellor` block entirely.
      - Remove `isHighRisk` calculation and omit `level`/`isHighRisk` keys from `ASSESSMENT_COMPLETED_TEACHER` payload.
    - Dependency: Step 9
    - Verification: `AssessmentEventListenerTest` passes.

11. **Refactor `StudentHealthProfileRiskListener` (Remove Auto-Referral)**
    - Files:
      - `backend/src/test/kotlin/com/medicalsystem/backend/event/StudentHealthProfileRiskListenerTest.kt`
      - `backend/src/main/kotlin/com/medicalsystem/backend/event/StudentHealthProfileRiskListener.kt`
    - Action:
      - In `StudentHealthProfileRiskListenerTest.kt`:
        - Remove auto-referral test methods (`high risk event creates exactly one awaiting-approval referral`, `second high risk event does not create a duplicate referral`, `no active head counsellor skips referral creation without failing`, `referral service failure never propagates...`, `non-high risk events are ignored`).
        - Add assertions verifying `onReferralInitiated` and `onStudentRegistered` execute without triggering referral creation.
      - In `StudentHealthProfileRiskListener.kt`:
        - Remove `onStudentRiskStatusChanged`, `createAutoReferral`, `AUTO_REFERRAL_TITLE`, `TERMINAL_REFERRAL_STATUSES`.
        - Remove `userRepository: UserRepository` and `referralService: ReferralService` constructor dependencies.
        - Retain `onReferralInitiated` and `onStudentRegistered`.
    - Dependency: Step 10
    - Verification: `StudentHealthProfileRiskListenerTest` passes.

---

### Phase 5: High Risk Roster Endpoint Removal & Backend Clean-up
12. **Remove High Risk endpoint and backend DTO**
    - Files:
      - `backend/src/test/kotlin/com/medicalsystem/backend/service/StudentServiceTest.kt`
      - `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentService.kt`
      - `backend/src/main/kotlin/com/medicalsystem/backend/controller/StudentController.kt`
      - `backend/src/main/kotlin/com/medicalsystem/backend/dto/HighRiskStudentDto.kt` (DELETE)
    - Action:
      - In `StudentServiceTest`: remove `fetchHighRiskStudents returns only visible flagged students sorted high first` test.
      - In `StudentService`: remove `fetchHighRiskStudents` method.
      - In `StudentController`: remove `@GetMapping("/high-risk") fun fetchHighRiskStudents(...)`.
      - Delete `HighRiskStudentDto.kt`.
    - Dependency: Steps 1-11
    - Verification: Run `./mvnw test` across all backend modules. Ensure 100% tests pass.

---

### Phase 6: Frontend API, Types & Invalidation Clean-up
13. **Update frontend notification types & delete legacy high-risk API**
    - Files:
      - `frontend/src/api/notifications.ts`
      - `frontend/src/api/highRisk.ts` (DELETE)
      - `frontend/src/components/assessments/AssessmentFlow.tsx`
      - `frontend/src/components/records/ReferralCreationForm.tsx`
    - Action:
      - In `frontend/src/api/notifications.ts`: add `canCreateReferral?: boolean | null;` to `NotificationDto`.
      - Delete `frontend/src/api/highRisk.ts`.
      - In `frontend/src/components/assessments/AssessmentFlow.tsx`: remove line 241 `queryClient.invalidateQueries({ queryKey: ['high-risk-students'] });`.
      - In `frontend/src/components/records/ReferralCreationForm.tsx`: ensure success handler invalidates `['notifications']` and `['/api/notifications']` in addition to `['/api/referrals']`.
    - Dependency: Step 12
    - Risk: Low

---

### Phase 7: Frontend Notifications View & Actions (TDD)
14. **Write failing unit tests for NotificationsView**
    - File: `frontend/src/components/notifications/NotificationsView.test.tsx`
    - Action:
      - Test `ASSESSMENT_HIGH_RISK_ALERT_TEACHER` renders header "高危心理测评预警", warning icon, and text with student name and crisis flags.
      - Test when high-risk alert has `canCreateReferral: true` (or undefined):
        - Both `发起转诊` and `查看学生` action buttons are rendered.
        - Clicking `发起转诊` calls `openCreation` with pre-filled `ReferralCreationForm` initialData:
          - `studentId: "42"`
          - `title: "高风险筛查转诊 - 陈明 (20240001)"`
          - `riskLevel: "HIGH"`
          - `severeRiskFactors: ['SUICIDAL_IDEATION']`
      - Test when high-risk alert has `canCreateReferral: false`:
        - `发起转诊` button is NOT rendered.
        - `查看学生` button is rendered, clicking calls `onViewStudent("42")`.
    - Dependency: Step 13
    - Risk: Low

15. **Update NotificationsView with dual actions and pre-filled referral creation**
    - File: `frontend/src/components/notifications/NotificationsView.tsx`
    - Action:
      - Add cases for `ASSESSMENT_HIGH_RISK_ALERT_TEACHER` in `getNotificationText`, `getNotificationTitle`, and `getNotificationIcon`.
      - Inject `useCreationOverlay()`: `const { openCreation, closeCreation, expandToFullscreen } = useCreationOverlay();`.
      - For high-risk notification items (`notification.messageCode === 'ASSESSMENT_HIGH_RISK_ALERT_HC' || notification.messageCode === 'ASSESSMENT_HIGH_RISK_ALERT_TEACHER'`):
        - If `notification.canCreateReferral !== false`:
          - Add action `发起转诊` (`variant: 'filled'`).
          - On click: parse payload (`studentId`, `studentNumber`, `studentName`, `riskStatus`, `riskFlags`).
          - Filter `severeRiskFactors` against `['SUICIDAL_IDEATION', 'SUICIDE_ATTEMPT', 'SELF_HARM']`.
          - Open `ReferralCreationForm` pre-filled via `openCreation("发起转诊 - " + studentName, <ReferralCreationForm onClose={closeCreation} initialData={{ ... }} />)` and `setTimeout(expandToFullscreen, 10)`.
        - Add action `查看学生` (`variant: 'text'`) calling `onViewStudent(String(studentId))`.
    - Dependency: Step 14
    - Verification: `NotificationsView.test.tsx` passes.

---

### Phase 8: High Risk View Deletion & Navigation Pages Clean-up (TDD)
16. **Write failing tests for HeadCouncillorPage and TeacherPage navigation**
    - Files:
      - `frontend/src/pages/HeadCouncillorPage.test.tsx` (New)
      - `frontend/src/pages/TeacherPage.test.tsx` (New)
    - Action:
      - Render pages with mock providers.
      - Assert that neither page renders a navigation item or button containing "高危名单".
      - Assert clicking dashboard activities of type `ASSESSMENT_*` or `HIGH_RISK_ASSESSMENT_SUBMITTED` navigates to `NOTIFICATIONS` tab.
    - Dependency: Step 15
    - Risk: Low

17. **Delete HighRiskListView and update navigation pages**
    - Files:
      - `frontend/src/components/records/HighRiskListView.tsx` (DELETE)
      - `frontend/src/pages/HeadCouncillorPage.tsx`
      - `frontend/src/pages/TeacherPage.tsx`
    - Action:
      - Delete `frontend/src/components/records/HighRiskListView.tsx`.
      - In `HeadCouncillorPage.tsx` & `TeacherPage.tsx`:
        - Remove `import { HighRiskListView } ...`.
        - Remove `HIGH_RISK` from `HeadCouncillorTabs` and `TeacherTabs`.
        - Remove `[Tabs.HIGH_RISK]: '高危名单'` from title maps.
        - Remove `case Tabs.HIGH_RISK:` in `renderActiveContent`.
        - Remove `<NavItem icon="warning" label="高危名单" ... />` from `Sidebar`.
        - In `onActivityClick`: change `type?.startsWith('ASSESSMENT_') || type === 'HIGH_RISK_ASSESSMENT_SUBMITTED'` destination to `HeadCouncillorTabs.NOTIFICATIONS` / `TeacherTabs.NOTIFICATIONS`.
        - Provide `onViewStudent={(studentId) => { setActivePage(Tabs.STUDENTS); setSelectedItem({ id: studentId }); }}` to `<NotificationsView>`.
    - Dependency: Step 16
    - Verification: `HeadCouncillorPage.test.tsx` and `TeacherPage.test.tsx` pass.

---

### Phase 9: Full-Stack Verification & Quality Gate
18. **Execute frontend and backend verification gates**
    - Commands:
      - Frontend Type Check: `cd frontend && npm run lint` (`tsc --noEmit`)
      - Frontend Unit Tests: `cd frontend && npm run test` (`vitest run`)
      - Backend Full Test Suite: `cd backend && ./mvnw test`
    - Success Invariants:
      - 0 compilation errors, 0 type errors.
      - 0 references to deleted files (`HighRiskListView`, `highRisk.ts`, `HighRiskStudentDto`).
      - All backend unit and integration tests green (including H2 JPA spec tests).
      - All frontend tests green.

---

## Risks & Mitigations
- **Risk**: Loss of safety net without auto-referral.
  - *Mitigation*: Both Head Councillor and assigned Teacher receive targeted high-risk alerts. If no recipients are notified, an explicit `logger.error` is emitted.
- **Risk**: Stale notifications showing `发起转诊` after referral creation.
  - *Mitigation*: `ReferralCreationForm` invalidates `notifications` query upon creation; `canCreateReferral` is dynamically evaluated on every read.
- **Risk**: SQL IN-clause syntax error on empty student list in JPA.
  - *Mitigation*: `ReferralRepositoryAdapter.findStudentIdsWithOpenReferral` guards against empty input by returning `emptySet()` immediately.
