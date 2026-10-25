# Implementation Plan: Cross-Portal Mobile Intake & Medical System Integration Fixes

## Overview
This implementation plan addresses all 10 root-cause categories documented in `.plans/analysis.md`. The plan establishes end-to-end integration across the Spring Boot Kotlin backend, desktop React frontend, and mobile student intake app: upgrading the desktop questionnaire player for polymorphic question types, unifying multi-role credentials and authentication, enabling bidirectional draft synchronization, implementing real psychometric scoring and event publishing, securing demographic projections and risk mapping, fixing dashboard metrics and notification alerts, and removing legacy mobile admin remnants.

---

## Writable Files

### Backend Source Files (`backend/`)
1. [`backend/src/main/kotlin/com/medicalsystem/backend/entity/ScaleDraftEntity.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/entity/ScaleDraftEntity.kt) (Category 1: Replace `@Lob` with `@Column(name = "answers_json", nullable = false, columnDefinition = "LONGTEXT")`)
2. [`backend/src/main/kotlin/com/medicalsystem/backend/config/DataInitializer.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/config/DataInitializer.kt) (Category 2 & 7: Seed student `phone` and BCrypt `passwordHash`; seed staff `passwordHash`; seed `"少数民族"`; seed `"comprehensive_student_intake_survey"`)
3. [`backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportService.kt) (Category 2: Set `userEntity.phone` and BCrypt hash of last 6 digits of `idCardNumber` or `"123456"`)
4. [`backend/src/main/kotlin/com/medicalsystem/backend/service/StaffRegistrationService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/StaffRegistrationService.kt) (Category 2: Hash `request.password` using `PasswordEncoder` and persist to `userEntity.passwordHash`)
5. [`backend/src/main/kotlin/com/medicalsystem/backend/dto/AuthDtos.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/dto/AuthDtos.kt) (Category 3: Add `role: UserRole? = null`, `userId: Long? = null`, `email: String? = null`, `name: String? = null` to `AuthResponse`)
6. [`backend/src/main/kotlin/com/medicalsystem/backend/service/AuthService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AuthService.kt) (Category 3: Support student and multi-role staff login via studentNumber, employeeNumber, email, phone, SYS-ADMIN + password)
7. [`backend/src/main/kotlin/com/medicalsystem/backend/service/UserVerificationService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/UserVerificationService.kt) (Category 3: Add phone number resolution in identifier lookup)
8. [`backend/src/main/kotlin/com/medicalsystem/backend/service/ScaleDraftService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/ScaleDraftService.kt) (Category 4: Add assignment `answers_json` fallback in `getDraft`)
9. [`backend/src/main/kotlin/com/medicalsystem/backend/controller/ScaleController.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/controller/ScaleController.kt) (Category 4: Non-empty answer count calculation and fallback alignment)
10. [`backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt) (Category 4 & 5: Sync `recordProgress` to `scale_drafts`; publish `AssessmentCompletedEvent` / `AssessmentAssignedEvent` / `AssessmentBatchDispatchedEvent` and pass scored psychometrics to `complete()`)
11. [`backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentAssignmentService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentAssignmentService.kt) (Category 5: Fix `assignAssessment` to register event after `save` so `assignment.id` is populated, and publish `AssessmentAssignedEvent`)
12. [`backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepositoryAdapter.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepositoryAdapter.kt) (Category 5: Preserve or dispatch pending aggregate events on save)
13. [`backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt) (Category 5: Implement real score calculation for clinical scales [PHQ-9, GAD-7, SCL-90, PSQI] and filter out non-psychometric sections)
14. [`backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfile.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfile.kt) (Category 6: Ensure `riskStatus: RiskStatus = RiskStatus.LOW` default and setter support)
15. [`backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentHealthProfileMapper.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentHealthProfileMapper.kt) (Category 6: Bi-directional mapping of `riskStatus` between entity and domain model)
16. [`backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentMapper.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentMapper.kt) (Category 6 & 7: Use `profile?.riskStatus` directly; use `MobileNumber.fromOrNull(num)`)
17. [`backend/src/main/kotlin/com/medicalsystem/backend/service/DemographicsProjector.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/DemographicsProjector.kt) (Category 7: Resolve `"少数民族"` to `"少数民族"` or `"其他"`)
18. [`backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt) (Category 8: Compute real pending assessment count in `getStudentDashboard`)
19. [`backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentJpaRepository.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentJpaRepository.kt) (Category 8: Add `countByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): Long`)

### Backend Test Files (`backend/`)
20. [`backend/src/test/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepositoryTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepositoryTest.kt) (Category 1: Test persistence and retrieval of large 377-question JSON payloads)
21. [`backend/src/test/kotlin/com/medicalsystem/backend/service/StaffRegistrationServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StaffRegistrationServiceTest.kt) (Category 2: Verify password hashing on staff registration)
22. [`backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportServiceTest.kt) (Category 2: Verify `phone` and default BCrypt password creation on student import)
23. [`backend/src/test/kotlin/com/medicalsystem/backend/controller/StudentAuthControllerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/controller/StudentAuthControllerTest.kt) (Category 3: Test login with student number, phone, and staff identifiers)
24. [`backend/src/test/kotlin/com/medicalsystem/backend/controller/AuthControllerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/controller/AuthControllerTest.kt) (Category 3: Verify controller contract for multi-role login response)
25. [`backend/src/test/kotlin/com/medicalsystem/backend/service/UserVerificationServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/UserVerificationServiceTest.kt) (Category 3: Test phone-based identifier lookup)
26. [`backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDraftIntegrationTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDraftIntegrationTest.kt) (Category 4: Verify draft sync between `recordProgress` and `scale_drafts`)
27. [`backend/src/test/kotlin/com/medicalsystem/backend/controller/ScaleControllerIntegrationTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/controller/ScaleControllerIntegrationTest.kt) (Category 4: Verify fallback from scale draft to assignment answers)
28. [`backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt) (Category 5: Verify section scoring sums and max scores)
29. [`backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt) (Category 5: Verify psychometrics persistence on event receipt)
30. [`backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt) (Category 5: Verify event publishing and draft purging on submission)
31. [`backend/src/test/kotlin/com/medicalsystem/backend/mapper/StudentMapperTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/mapper/StudentMapperTest.kt) (Category 6 & 7: Test `profile.riskStatus` preservation and `MobileNumber.fromOrNull` fallback)
32. [`backend/src/test/kotlin/com/medicalsystem/backend/service/StudentRiskEvaluatorTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StudentRiskEvaluatorTest.kt) (Category 6: Update test cases to reflect risk evaluation)
33. [`backend/src/test/kotlin/com/medicalsystem/backend/service/DemographicsProjectorTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/DemographicsProjectorTest.kt) (Category 7: Test `"少数民族"` ethnicity mapping)
34. [`backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt) (Category 8: Verify student dashboard `assessmentsCount`)

### Frontend Source Files (`frontend/`)
35. [`frontend/src/api/auth.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/api/auth.ts) (Category 3: Add `login` API method and login DTO types)
36. [`frontend/src/contexts/AuthContext.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/AuthContext.tsx) (Category 3: Add `loginWithSession(session: UserSession)` method)
37. [`frontend/src/components/auth/LoginOverlay.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/auth/LoginOverlay.tsx) (Category 3: Implement real login API call in Step 2 and update `AuthContext`)
38. [`frontend/src/components/records/RecordsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/RecordsView.tsx) (Category 8: Use `session.token` from `useAuth()`, add token to queryKey)
39. [`frontend/src/pages/StudentPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/StudentPage.tsx) (Category 8: Include `session?.token` in queryKey for `/api/dashboard/student`)
40. [`frontend/src/components/notifications/NotificationsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/notifications/NotificationsView.tsx) (Category 5 & 8: Add Chinese formatters and action handlers for `ASSESSMENT_*` notifications)
41. [`frontend/src/types/index.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/types/index.ts) (Category 9: Extend `AssessmentQuestionDto`, `AssessmentOptionDto`, `SubmitAssessmentRequest` with polymorphic fields)
42. [`frontend/src/components/assessments/AssessmentData.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentData.ts) (Category 9: Extend `Question`, `QuestionOption` with polymorphic fields)
43. [`frontend/src/components/assessments/AssessmentFlow.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentFlow.tsx) (Category 9: Render polymorphic question types `text`, `number`, `slider`, `date`, `single_choice`, `multiple_choice`, `hasTextInput`, `zeroOptionLabel` via MD3)
44. [`frontend/src/mocks/data/assessments.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/mocks/data/assessments.ts) (Category 9: Align mock assessment catalog and items with `comprehensive_student_intake_survey`)
44b. [`frontend/src/main.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/main.tsx) (Category 9: Register `@material/web/slider/slider.js` custom element)

### Frontend Test Files (`frontend/`)
45. [`frontend/src/components/auth/LoginOverlay.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/auth/LoginOverlay.test.tsx) (Category 3: Test real login flow in Step 2)
46. [`frontend/src/contexts/AuthContext.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/AuthContext.test.tsx) (Category 3: Test `loginWithSession`)
47. [`frontend/src/components/assessments/AssessmentFlow.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentFlow.test.tsx) (Category 9: Test rendering and answering polymorphic question types)
48. [`frontend/src/components/notifications/NotificationsView.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/notifications/NotificationsView.test.tsx) (Category 8: Test new assessment notification templates and action clicks)

### Mobile Source Files (`mobile/`)
49. [`mobile/src/App.tsx`](file:///Volumes/Files/Programming/medical-system/mobile/src/App.tsx) (Category 10: Simplify to render `StudentApp` directly, remove `/admin` route and imports)
50. [`mobile/src/App.test.tsx`](file:///Volumes/Files/Programming/medical-system/mobile/src/App.test.tsx) (Category 10: Verify student app renders and tests pass cleanly)

### Mobile Deleted Files (`mobile/src/admin/*`)
51. `mobile/src/admin/AdminApp.test.tsx`
52. `mobile/src/admin/AdminApp.tsx`
53. `mobile/src/admin/api/adminApi.ts`
54. `mobile/src/admin/components/DataTable.tsx`
55. `mobile/src/admin/components/DeleteStudentDialog.test.tsx`
56. `mobile/src/admin/components/DeleteStudentDialog.tsx`
57. `mobile/src/admin/components/DetailsPanel.test.tsx`
58. `mobile/src/admin/components/DetailsPanel.tsx`
59. `mobile/src/admin/components/ExpandableSearchBar.test.tsx`
60. `mobile/src/admin/components/ExpandableSearchBar.tsx`
61. `mobile/src/admin/components/FilterChip.test.tsx`
62. `mobile/src/admin/components/FilterChip.tsx`
63. `mobile/src/admin/components/FullScreenView.tsx`
64. `mobile/src/admin/components/MetricCard.test.tsx`
65. `mobile/src/admin/components/MetricCard.tsx`
66. `mobile/src/admin/components/ResetPasswordDialog.test.tsx`
67. `mobile/src/admin/components/ResetPasswordDialog.tsx`
68. `mobile/src/admin/components/SplitButton.test.tsx`
69. `mobile/src/admin/components/SplitButton.tsx`
70. `mobile/src/admin/config/layoutConstants.ts`
71. `mobile/src/admin/contexts/AdminAuthContext.tsx`
72. `mobile/src/admin/contexts/SidebarContext.tsx`
73. `mobile/src/admin/layout/AccountMenu.tsx`
74. `mobile/src/admin/layout/AdminCanvasHeader.tsx`
75. `mobile/src/admin/layout/AdminHeader.tsx`
76. `mobile/src/admin/layout/AdminMainContent.tsx`
77. `mobile/src/admin/layout/AdminNavItem.tsx`
78. `mobile/src/admin/layout/AdminSidebar.tsx`
79. `mobile/src/admin/layout/GlobalSearch.tsx`
80. `mobile/src/admin/pages/AdminLoginPage.tsx`
81. `mobile/src/admin/pages/DashboardPage.test.tsx`
82. `mobile/src/admin/pages/DashboardPage.tsx`
83. `mobile/src/admin/pages/StudentManagementPage.test.tsx`
84. `mobile/src/admin/pages/StudentManagementPage.tsx`

### Planning Files
85. [`.plans/analysis.md`](file:///Volumes/Files/Programming/medical-system/.plans/analysis.md)
86. [`.plans/task.md`](file:///Volumes/Files/Programming/medical-system/.plans/task.md)

---

## Test-Driven Development (TDD) Specifications

### Bug Fix 1: Draft Storage Column Definition (Category 1)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepositoryTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepositoryTest.kt)
- **Test Case**: `testSaveAndRetrieveLongJsonDraft()`: Save a `ScaleDraftEntity` with `answersJson` exceeding 65,535 bytes (simulating 377 answered questions with notes and multi-choice selections) and verify retrieval preserves the exact JSON without truncation.

### Bug Fix 2: Password Hashing & Contact Number Persistence (Category 2)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/StaffRegistrationServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StaffRegistrationServiceTest.kt)
  - **Test Case**: `registerStaff persists bcrypt hashed password`: Register a teacher/doctor with password `"Secret123"`, assert `userEntity.passwordHash != null` and `BCryptPasswordEncoder().matches("Secret123", userEntity.passwordHash)` returns `true`.
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportServiceTest.kt)
  - **Test Case**: `registerNewStudent populates phone and bcrypt password from id card`: Import student with ID card `"110101200405123457"` and contact number `"13800138000"`, assert `savedUser.phone == "13800138000"` and `BCryptPasswordEncoder().matches("123457", savedUser.passwordHash)` returns `true`.

### Bug Fix 3: Multi-Role Login & Real JWT Auth (Category 3)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/UserVerificationServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/UserVerificationServiceTest.kt)
  - **Test Case**: `verifyIdentifier with phone number resolves user`: Enter registered phone `"13800138000"`, assert `result.exists == true`, `result.isAccountActive == true`.
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/controller/StudentAuthControllerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/controller/StudentAuthControllerTest.kt)
  - **Test Case**: `login with teacher employee number and password returns valid JWT and role TEACHER`.
  - **Test Case**: `login with student phone and password returns valid JWT and role STUDENT`.
  - **Test Case**: `login with email and password returns valid JWT`.
- **Test File**: [`frontend/src/contexts/AuthContext.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/AuthContext.test.tsx)
  - **Test Case**: `loginWithSession updates role and token and clears query cache`: Call `loginWithSession({ role: 'teacher', token: 'jwt-real-token' })`, verify session state reflects `teacher` and `jwt-real-token`.
- **Test File**: [`frontend/src/components/auth/LoginOverlay.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/auth/LoginOverlay.test.tsx)
  - **Test Case**: `Step 2 submit executes real login request and closes dialog on success`: Mock `POST /api/auth/login`, simulate entering password, click submit, verify login API was called with resolved identifier, and overlay closes.

### Bug Fix 4: Bidirectional Draft Sync & Progress Recording (Category 4)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDraftIntegrationTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDraftIntegrationTest.kt)
  - **Test Case**: `recordProgress synchronizes answers to scale_drafts`: Call `PUT /api/assessments/{id}/progress`, assert `scaleDraftJpaRepository.findByStudentIdAndScaleCode(...)` contains the updated answers.
  - **Test Case**: `getDraft falls back to assessment_assignments answersJson`: Given an assignment with `answersJson` but no `scale_drafts` record, calling `scaleDraftService.getDraft(...)` returns the answers with status `IN_PROGRESS`.

### Bug Fix 5: Event Publishing & Psychometric Scoring (Category 5)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt)
  - **Test Case**: `scoreSection computes real score and max for PHQ_9`: Given 9 items with answers `[2, 2, 2, 2, 2, 2, 2, 2, 2]`, score is 18 and max is 27.
  - **Test Case**: `scoreSection computes real score and max for GAD_7`: Given 7 items with answers `[3, 3, 3, 3, 3, 3, 3]`, score is 21 and max is 21.
  - **Test Case**: `scoreSection returns null for non-psychometric sections`: e.g., `demographics_survey` returns null and is omitted from `PsychometricTest` list.
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt)
  - **Test Case**: `submitAssessment dispatches AssessmentCompletedEvent with scored psychometrics`.
  - **Test Case**: `assignToStudent dispatches AssessmentAssignedEvent with assigned studentId and non-null assignmentId`.
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt)
  - **Test Case**: `handleAssessmentCompleted records scored tests in studentHealthProfile`.

### Bug Fix 6: Risk Status Preservation & Student Mapping (Category 6)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/mapper/StudentMapperTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/mapper/StudentMapperTest.kt)
  - **Test Case**: `toModel preserves profile riskStatus HIGH when healthProfile has HIGH`: Assert `student.riskStatus == RiskStatus.HIGH`.
  - **Test Case**: `toModel safely handles non-standard contact numbers using MobileNumber fromOrNull without throwing exception`.
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/StudentRiskEvaluatorTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StudentRiskEvaluatorTest.kt)
  - **Test Case**: Verify evaluator handles clinical risk scores from tests.

### Bug Fix 7: Demographics Projection & Minorities Fallback (Category 7)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/DemographicsProjectorTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/DemographicsProjectorTest.kt)
  - **Test Case**: `projectDemographics maps 少数民族 to 少数民族 when present or 其他 as fallback, not 汉族`.

### Bug Fix 8: Dashboard Pending Counts & Notification UI (Category 8)
- **Test File**: [`backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt)
  - **Test Case**: `getStudentDashboard returns actual pending assessment count from repository`.
- **Test File**: [`frontend/src/components/notifications/NotificationsView.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/notifications/NotificationsView.test.tsx)
  - **Test Case**: Renders Chinese card for `ASSESSMENT_HIGH_RISK_ALERT_HC`, `ASSESSMENT_ASSIGNED_STUDENT`, `ASSESSMENT_COMPLETED_TEACHER`, and triggers view student callback on click.

### Bug Fix 9: Desktop Polymorphic Questionnaire Player (Category 9)
- **Test File**: [`frontend/src/components/assessments/AssessmentFlow.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentFlow.test.tsx)
  - **Test Case**: Renders `<md-outlined-text-field>` on `text` questions and records typed string answers.
  - **Test Case**: Renders `<md-outlined-text-field type="number">` on `number` questions and supports `zeroOptionLabel` (e.g., "从未喝过酒").
  - **Test Case**: Renders `<md-slider>` on `slider` questions and records numeric value.
  - **Test Case**: Renders `<md-checkbox>` on `multiple_choice` questions and allows multi-selection.
  - **Test Case**: Renders supplementary text input when `opt.hasTextInput` is true.

### Bug Fix 10: Clean Mobile Intake App (Category 10)
- **Test File**: [`mobile/src/App.test.tsx`](file:///Volumes/Files/Programming/medical-system/mobile/src/App.test.tsx)
  - **Test Case**: Mounts and verifies `StudentApp` displays tasks and navigation tabs without any `/admin` dependencies or bundle references.

---

## Step-by-Step Execution Order

### Phase 1: Database Persistence & Entity Column Definition
1. **Update ScaleDraftEntity column definition** ([`ScaleDraftEntity.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/entity/ScaleDraftEntity.kt))
   - Action: Replace `@Lob` with `@Column(name = "answers_json", nullable = false, columnDefinition = "LONGTEXT")`.
   - Verification: Run [`ScaleDraftJpaRepositoryTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepositoryTest.kt).
2. **Add countByStudentIdAndStatus query** ([`AssessmentAssignmentJpaRepository.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentJpaRepository.kt))
   - Action: Add `fun countByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): Long`.

### Phase 2: Domain Risk Models & Demographics Projection
3. **Preserve riskStatus in StudentHealthProfile & Mappers** ([`StudentHealthProfile.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfile.kt), [`StudentHealthProfileMapper.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentHealthProfileMapper.kt), [`StudentMapper.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/mapper/StudentMapper.kt))
   - Action: In `StudentHealthProfile`, ensure `var riskStatus: RiskStatus = RiskStatus.LOW`. In `StudentHealthProfileMapper`, map `riskStatus` bi-directionally. In `StudentMapper.toModel`, map `riskStatus = profile?.riskStatus ?: RiskStatus.LOW` and use `MobileNumber.fromOrNull(num)`.
   - Verification: Create and run [`StudentMapperTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/mapper/StudentMapperTest.kt).
4. **Fix Minorities Ethnicity Resolution** ([`DemographicsProjector.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/DemographicsProjector.kt))
   - Action: When resolving raw ethnicity choice `"少数民族"`, search for `"少数民族"`, and if not found, fall back to `"其他"`.
   - Verification: Create and run [`DemographicsProjectorTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/DemographicsProjectorTest.kt).

### Phase 3: Credential Population & Data Initializer
5. **Populate phone and BCrypt password in StudentImportService** ([`StudentImportService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/StudentImportService.kt))
   - Action: In `registerNewStudent`, set `userEntity.phone = row.contactNumber` and `userEntity.passwordHash = passwordEncoder.encode(last6DigitsOfIdCard)`.
   - Verification: Run [`StudentImportServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StudentImportServiceTest.kt).
6. **Populate passwordHash in StaffRegistrationService** ([`StaffRegistrationService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/StaffRegistrationService.kt))
   - Action: Inject `passwordEncoder: PasswordEncoder` and set `userEntity.passwordHash = passwordEncoder.encode(request.password)`.
   - Verification: Run [`StaffRegistrationServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/StaffRegistrationServiceTest.kt).
7. **Upgrade DataInitializer Seeds** ([`DataInitializer.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/config/DataInitializer.kt))
   - Action: Seed `"少数民族"` into `standardEthnicities`; populate `phone` and BCrypt `passwordHash` (last 6 of ID card or `"123456"`) for students u1..u10; populate `passwordHash` for all staff; change seeded assignments from `"MENTAL_HEALTH_ASSESSMENT"` to `"comprehensive_student_intake_survey"`.

### Phase 4: Multi-Role Authentication & Phone Verification
8. **Extend Auth DTOs** ([`AuthDtos.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/dto/AuthDtos.kt))
   - Action: Add `role: UserRole? = null`, `userId: Long? = null`, `email: String? = null`, `name: String? = null` to `AuthResponse`.
9. **Implement Multi-Role Identifier Resolution in AuthService** ([`AuthService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AuthService.kt))
   - Action: In `login(request)`, resolve user by: studentNumber, teacher employeeNumber, doctor employeeNumber, head counsellor employeeNumber, trial admin employeeNumber, email, phone, or `"SYS-ADMIN"`. Match password using `passwordEncoder`. Return user info and role.
10. **Add Phone Lookup in UserVerificationService** ([`UserVerificationService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/UserVerificationService.kt))
    - Action: In `resolveByIdNumber`, check `userJpaRepository.findByPhone(idNumber)`.
    - Verification: Run [`UserVerificationServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/UserVerificationServiceTest.kt) and [`StudentAuthControllerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/controller/StudentAuthControllerTest.kt).

### Phase 5: Draft Sync, Event Publishing & Scoring Engine
11. **Sync recordProgress with ScaleDraftService** ([`AssessmentService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt))
    - Action: In `recordProgress`, call `scaleDraftService?.saveDraft(assignment.studentId, assignment.batteryCode.value, SaveDraftRequest(answers = request.answers, updatedAt = System.currentTimeMillis()))`.
12. **Implement Fallback in ScaleDraftService and ScaleController** ([`ScaleDraftService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/ScaleDraftService.kt), [`ScaleController.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/controller/ScaleController.kt))
    - Action: When `scaleDraftJpaRepository` has no draft, deserialize `assessment_assignments.answers_json` if present. Count non-empty answers consistently.
    - Verification: Run [`AssessmentDraftIntegrationTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDraftIntegrationTest.kt) and [`ScaleControllerIntegrationTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/controller/ScaleControllerIntegrationTest.kt).
13. **Implement Real Psychometric Scoring in AssessmentScoringEngine** ([`AssessmentScoringEngine.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt))
    - Action: Calculate sum of points and question maxima for clinical sections (`PHQ_9`, `GAD_7`, `SCL_90`, `PSQI`, etc.). Return null for non-clinical sections (such as demographics, life events).
    - Verification: Run [`AssessmentScoringEngineTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt).
14. **Publish Domain Events on Assignment & Submission** ([`AssessmentService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt), [`AssessmentAssignmentService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentAssignmentService.kt), [`AssessmentAssignmentRepositoryAdapter.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepositoryAdapter.kt))
    - Action: In `AssessmentAssignmentService` and `AssessmentService`, initialize and publish `AssessmentAssignedEvent` after the aggregate is saved with a non-null id. In `AssessmentService.submitAssessment`, publish `AssessmentCompletedEvent` and pass only clinical tests to `assignment.complete()`. Preserve/dispatch registered events in repository adapter.
    - Verification: Run [`AssessmentServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt) and [`AssessmentCompletedListenerTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt).

### Phase 6: Dashboard Services & Desktop Authorization Wiring
15. **Compute Real Student Assessments Count in DashboardService** ([`DashboardService.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt))
    - Action: In `getStudentDashboard`, set `assessmentsCount = assessmentAssignmentRepository.countByStudentIdAndStatus(user.id, AssessmentStatus.PENDING)`.
    - Verification: Run [`DashboardServiceTest.kt`](file:///Volumes/Files/Programming/medical-system/backend/src/test/kotlin/com/medicalsystem/backend/service/DashboardServiceTest.kt).
16. **Wire authApi, AuthContext and LoginOverlay** ([`frontend/src/api/auth.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/api/auth.ts), [`frontend/src/contexts/AuthContext.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/AuthContext.tsx), [`frontend/src/components/auth/LoginOverlay.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/auth/LoginOverlay.tsx))
    - Action: Add `authApi.login(identifier, password)`. Add `loginWithSession(session: UserSession)` to `AuthContext`. In `LoginOverlay.handleStep2Submit`, call `authApi.login`, convert returned role to lowercase, update session, and close overlay.
    - Verification: Run [`LoginOverlay.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/auth/LoginOverlay.test.tsx) and [`AuthContext.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/contexts/AuthContext.test.tsx).
17. **Fix Token Headers & Query Keys in RecordsView and StudentPage** ([`frontend/src/components/records/RecordsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/records/RecordsView.tsx), [`frontend/src/pages/StudentPage.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/pages/StudentPage.tsx))
    - Action: In `RecordsView`, replace `'Bearer student_token_chen'` with `session.token` from `useAuth()`, and add `session.token` to `queryKey`. In `StudentPage`, add `session?.token` to `queryKey` for `/api/dashboard/student`.
18. **Support Assessment Notifications in NotificationsView** ([`frontend/src/components/notifications/NotificationsView.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/notifications/NotificationsView.tsx))
    - Action: Add Chinese translation templates and title/icon mappings for `ASSESSMENT_HIGH_RISK_ALERT_HC`, `ASSESSMENT_ASSIGNED_STUDENT`, `ASSESSMENT_COMPLETED_TEACHER`; handle `VIEW_STUDENT` action button.
    - Verification: Create and run [`NotificationsView.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/notifications/NotificationsView.test.tsx).

### Phase 7: Mobile Admin Pruning
19. **Delete mobile/src/admin/* directory** (Files 51–84)
    - Action: Remove all 34 files in `mobile/src/admin/`.
20. **Simplify mobile/src/App.tsx** ([`mobile/src/App.tsx`](file:///Volumes/Files/Programming/medical-system/mobile/src/App.tsx))
    - Action: Remove lazy load of `AdminApp` and `isAdminRoute` check. Directly return `<StudentApp />`.
    - Verification: Run `npm test` in `mobile/` (`mobile/src/App.test.tsx`).

### Phase 8: Desktop Polymorphic Questionnaire Player Upgrade
21. **Extend Types & AssessmentData** ([`frontend/src/types/index.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/types/index.ts), [`frontend/src/components/assessments/AssessmentData.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentData.ts))
    - Action: Add `type`, `min`, `max`, `step`, `minLabel`, `maxLabel`, `zeroOptionLabel`, `placeholder`, `field` to question interfaces, and `hasTextInput`, `textInputLabel`, `textInputPlaceholder` to options interfaces. Update `answers` state to accept `Record<string, any>`.
22. **Upgrade AssessmentFlow Component Rendering** ([`frontend/src/components/assessments/AssessmentFlow.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentFlow.tsx))
    - Action: Render polymorphic question types:
      - `single_choice`: Options with radio icons and supplementary text field when `opt.hasTextInput`.
      - `multiple_choice`: Options with `<md-checkbox>` and supplementary text input.
      - `slider`: `<md-slider>` with score preview card and boundary labels.
      - `number`: `<md-outlined-text-field type="number">` with `zeroOptionLabel` toggle.
      - `text`: `<md-outlined-text-field type="text">`.
      - `date`: Date field with year/month/day selectors.
    - Verification: Run [`AssessmentFlow.test.tsx`](file:///Volumes/Files/Programming/medical-system/frontend/src/components/assessments/AssessmentFlow.test.tsx).
23. **Align MSW Mock Catalog with Comprehensive Survey** ([`frontend/src/mocks/data/assessments.ts`](file:///Volumes/Files/Programming/medical-system/frontend/src/mocks/data/assessments.ts))
    - Action: Align mock catalog battery codes to `comprehensive_student_intake_survey`.

---

## Acceptance Criteria & Verification Gates

### Backend Gates
- [ ] `./mvnw clean test` passes 100% of unit and integration tests across all services, repositories, and controllers.
- [ ] `ScaleDraftJpaRepositoryTest` confirms `answersJson` > 64KB persists without MySQL truncation error.
- [ ] `StudentAuthControllerTest` confirms student, teacher, doctor, head counsellor, and trial admin accounts can authenticate with identifier + password.
- [ ] `AssessmentDraftIntegrationTest` confirms progress updates sync bi-directionally to drafts and fallback to assignments.
- [ ] `AssessmentScoringEngineTest` confirms subscale scores and maxima match clinical thresholds for PHQ-9 and GAD-7.
- [ ] `StudentMapperTest` confirms `profile.riskStatus` (`HIGH`, `MEDIUM`) is preserved and malformed phone numbers do not throw 500 exceptions.
- [ ] `DemographicsProjectorTest` confirms `"少数民族"` resolves without falling back to `"汉族"`.
- [ ] `DashboardServiceTest` confirms student metrics reflect real pending assessment counts.

### Frontend Gates
- [ ] `cd frontend && npm run lint` (`tsc --noEmit`) passes with zero type errors.
- [ ] `cd frontend && npm run test` passes all Vitest unit and component tests.
- [ ] `LoginOverlay` Step 2 authenticates against real backend endpoint and updates active user session.
- [ ] `AssessmentFlow` successfully renders `text`, `number`, `slider`, `date`, `single_choice`, `multiple_choice`, and handles `zeroOptionLabel` and `hasTextInput` using Material Web components.
- [ ] `RecordsView` passes real `session.token` in Authorization header and scopes React Query cache to `session.token`.
- [ ] `NotificationsView` formats all assessment-related message codes in clear Chinese and provides working action triggers.
- [ ] `cd frontend && npm run build` produces a production build without bundling errors.

### Mobile Gates
- [ ] `mobile/src/admin/` is completely removed.
- [ ] `cd mobile && npm run lint` passes with zero type errors.
- [ ] `cd mobile && npm run test` passes all Vitest test suites.
- [ ] `cd mobile && npm run build` produces a production build of the student intake app without admin dependencies.
