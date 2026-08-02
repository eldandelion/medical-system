# Project Index & Architecture Map

## Overview
This document maps the primary domain boundaries of the University Medical Screening System, connecting frontend UI modules with their corresponding backend DDD aggregates, entities, and services.

---

## 1. Referral & Triage Workflow
Manages the end-to-end multi-step referral lifecycle from initial submission through psychiatric triage, hospital assignment, appointment scheduling, and outcome closure. Enforces role-based action permissions and trackable status transitions across counselors, teachers, and admins.

- **Frontend**:
  - Components: `frontend/src/components/records/ReferralManagementView.tsx`, `frontend/src/components/records/ReferralDetailsView.tsx`, `frontend/src/components/records/ReferralCreationForm.tsx`, `frontend/src/components/records/ReferralTracker.tsx`, `frontend/src/components/records/ReferralOverviewTab.tsx`, `frontend/src/components/records/ReferralTrackerTab.tsx`, `frontend/src/components/records/ReferralActionFooter.tsx`, `frontend/src/components/records/ReferralStatusCard.tsx`
  - Hooks & Utilities: `frontend/src/hooks/useReferralActions.ts`, `frontend/src/utils/referralUtils.ts`
- **Backend**:
  - Domain Models & Policy: `backend/src/main/kotlin/com/medicalsystem/backend/model/Referral.kt`, `ReferralStatus.kt`, `ReferralType.kt`, `ReferralAction.kt`, `ReferralStepModel.kt`, `ReferralStepType.kt`, `ReferralStepStatus.kt`, `ReferralDestinationModel.kt`, `ReferralFactory.kt`, `ReferralVisibilityPolicy.kt`
  - Entities: `backend/src/main/kotlin/com/medicalsystem/backend/entity/ReferralEntity.kt`, `ReferralStepEntity.kt`, `ReferralDestinationEntity.kt`, `AttachmentEntity.kt`
  - Persistence: `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepository.kt`, `ReferralStepRepository.kt`, `ReferralDestinationRepository.kt`, `AttachmentRepository.kt`
  - Application Service & Mappers: `backend/src/main/kotlin/com/medicalsystem/backend/service/ReferralService.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/mapper/ReferralMapper.kt`
  - API & DTOs: `backend/src/main/kotlin/com/medicalsystem/backend/controller/ReferralController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/dto/ReferralDto.kt`, `ReferralDetailsDto.kt`, `ReferralTrackingDto.kt`, `CreateReferralDto.kt`, `ApproveReferralDto.kt`, `RejectReferralDto.kt`, `AssignDoctorDto.kt`, `ScheduleAppointmentDto.kt`

---

## 2. Student Health Profiles & Psychometrics
Maintains student demographic information, academic affiliations, health profiles, dynamic risk severity indicators, and psychometric screening instruments. Synchronizes student risk levels in response to questionnaire responses and new referral events.

- **Frontend**:
  - Components: `frontend/src/components/students/StudentsView.tsx`, `frontend/src/components/students/StudentDetailsView.tsx`, `frontend/src/components/assessments/AssessmentsView.tsx`, `frontend/src/components/assessments/AssessmentFlow.tsx`, `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx`, `frontend/src/components/assessments/PsychometricsTabContent.tsx`, `frontend/src/components/profile/ProfileView.tsx`
  - Hooks: `frontend/src/hooks/useProfileSummary.ts`
- **Backend**:
  - Domain Models & Policies: `backend/src/main/kotlin/com/medicalsystem/backend/model/Student.kt`, `StudentHealthProfile.kt`, `StudentHealthProfileFactory.kt`, `StudentVisibilityPolicy.kt`, `Demographics.kt`, `RiskStatus.kt`, `RiskFlagName.kt`, `FlagStatus.kt`, `TestResultName.kt`, `ClinicalStatusType.kt`, `AcademicYear.kt`, `AcademicModels.kt`
  - Entities: `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentEntity.kt`, `StudentHealthProfileEntity.kt`, `StudentDemographicsEntity.kt`, `RiskFlagEntity.kt`, `PsychometricTestEntity.kt`, `CollegeEntity.kt`, `SchoolDepartmentEntity.kt`, `MajorEntity.kt`, `EthnicityEntity.kt`
  - Persistence: `backend/src/main/kotlin/com/medicalsystem/backend/repository/StudentRepository.kt`, `StudentRepositoryAdapter.kt`, `StudentHealthProfileRepository.kt`, `StudentDemographicsRepository.kt`, `PsychometricTestRepository.kt`
  - Services & Event Handlers: `backend/src/main/kotlin/com/medicalsystem/backend/service/StudentService.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/event/StudentHealthProfileRiskListener.kt`
  - API & DTOs: `backend/src/main/kotlin/com/medicalsystem/backend/controller/StudentController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/dto/StudentDto.kt`, `DemographicsDto.kt`, `PsychometricsSummaryDto.kt`

---

## 3. Hospital Resources & Doctor Scheduling
Coordinates external partner hospital networks, specialized departments, and doctor consultation calendars. Enables trial administrators and doctors to allocate appointment time slots and manage capacity.

- **Frontend**:
  - Components: `frontend/src/components/common/DoctorScheduleCalendar.tsx`, `frontend/src/components/dashboard/DashboardCalendarWidget.tsx`, `frontend/src/components/staff/StaffManagementView.tsx`, `frontend/src/components/staff/StaffDetailsView.tsx`
- **Backend**:
  - Domain Models: `backend/src/main/kotlin/com/medicalsystem/backend/model/Doctor.kt`, `Appointment.kt`, `ClinicalModels.kt`
  - Entities: `backend/src/main/kotlin/com/medicalsystem/backend/entity/HospitalEntity.kt`, `HospitalDepartmentEntity.kt`, `DoctorEntity.kt`, `AppointmentEntity.kt`
  - Persistence: `backend/src/main/kotlin/com/medicalsystem/backend/repository/HospitalRepository.kt`, `HospitalDepartmentRepository.kt`, `DoctorRepository.kt`, `AppointmentRepository.kt`
  - Services: `backend/src/main/kotlin/com/medicalsystem/backend/service/HospitalService.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/service/DoctorService.kt`
  - API & DTOs: `backend/src/main/kotlin/com/medicalsystem/backend/controller/HospitalController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/controller/DoctorController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/dto/HospitalDto.kt`, `DoctorDto.kt`

---

## 4. Clinical Consultation Feedback & Outcomes
Captures diagnosis summaries, formal medical notes, prescription plans, and supporting documentation submitted by doctors following hospital consultations. Feeds post-consultation outcomes back into student health profiles and referral trackers.

- **Frontend**:
  - Components: `frontend/src/components/records/FeedbackCreationForm.tsx`, `frontend/src/components/records/ReferralFeedbackTab.tsx`, `frontend/src/components/common/AttachmentList.tsx`
- **Backend**:
  - Domain Models: `backend/src/main/kotlin/com/medicalsystem/backend/model/ReferralFeedback.kt`, `FeedbackAttachment.kt`
  - Entities: `backend/src/main/kotlin/com/medicalsystem/backend/entity/ReferralFeedbackEntity.kt`, `FeedbackAttachmentEntity.kt`
  - Persistence: `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralFeedbackRepository.kt`, `FeedbackAttachmentRepository.kt`
  - Services: `backend/src/main/kotlin/com/medicalsystem/backend/service/FeedbackService.kt`
  - API & DTOs: `backend/src/main/kotlin/com/medicalsystem/backend/controller/FeedbackController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/dto/FeedbackCreationRequest.kt`, `AttachmentDto.kt`

---

## 5. Notifications & Real-Time Alerts
Provides event-driven system notifications and urgent triage banners across the application. Supports unread status tracking and direct action deep-linking to relevant student cases and referrals.

- **Frontend**:
  - Components: `frontend/src/components/notifications/NotificationsView.tsx`, `frontend/src/components/notifications/NotificationItem.tsx`, `frontend/src/components/notifications/UrgentAlert.tsx`
  - API & Hooks: `frontend/src/api/notifications.ts`, `frontend/src/hooks/useNotifications.ts`
- **Backend**:
  - Domain Models & Enums: `backend/src/main/kotlin/com/medicalsystem/backend/model/Notification.kt`, `NotificationActionType.kt`, `NotificationMessageCode.kt`
  - Entities & Converters: `backend/src/main/kotlin/com/medicalsystem/backend/entity/NotificationEntity.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/converter/NotificationActionTypeConverter.kt`, `NotificationMessageCodeConverter.kt`
  - Persistence & Publishing: `backend/src/main/kotlin/com/medicalsystem/backend/repository/NotificationRepository.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/event/DomainEventPublisher.kt`
  - Services: `backend/src/main/kotlin/com/medicalsystem/backend/service/NotificationService.kt`
  - API & DTOs: `backend/src/main/kotlin/com/medicalsystem/backend/controller/NotificationController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/dto/NotificationDto.kt`

---

## 6. Dashboard Aggregates & Analytics
Aggregates key operational metrics, triage queue counts, upcoming appointments, and risk status distributions customized for each user role. Provides quick-action overviews for fast daily triage and caseload management.

- **Frontend**:
  - Components: `frontend/src/components/dashboard/DashboardView.tsx`, `frontend/src/components/dashboard/DashboardComponents.tsx`, `frontend/src/components/dashboard/DashboardCalendarWidget.tsx`
  - Pages: `frontend/src/pages/StudentPage.tsx`, `frontend/src/pages/TeacherPage.tsx`, `frontend/src/pages/HeadCouncillorPage.tsx`, `frontend/src/pages/TrialAdminPage.tsx`, `frontend/src/pages/DoctorPage.tsx`
- **Backend**:
  - Services: `backend/src/main/kotlin/com/medicalsystem/backend/service/DashboardService.kt`
  - API & DTOs: `backend/src/main/kotlin/com/medicalsystem/backend/controller/DashboardController.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/dto/DashboardDto.kt`

---

## 7. Identity, Access & Security Context
Handles authenticated user resolution and role distinction across Students, Teachers, Head Councillors, Trial Admins, and Doctors. Injects caller context via custom argument resolvers to enforce granular authorization policies across domain services.

- **Frontend**:
  - Context & Shell: `frontend/src/contexts/AuthContext.tsx`, `frontend/src/components/layout/Shell.tsx`, `frontend/src/components/layout/Header.tsx`, `frontend/src/components/layout/Sidebar.tsx`
- **Backend**:
  - Domain Models: `backend/src/main/kotlin/com/medicalsystem/backend/model/User.kt`, `UserRole.kt`, `Teacher.kt`, `HeadCounsellor.kt`, `TrialAdmin.kt`
  - Entities: `backend/src/main/kotlin/com/medicalsystem/backend/entity/UserEntity.kt`, `TeacherEntity.kt`, `HeadCounsellorEntity.kt`, `TrialAdminEntity.kt`
  - Persistence: `backend/src/main/kotlin/com/medicalsystem/backend/repository/UserRepository.kt`, `TeacherRepository.kt`, `HeadCounsellorRepository.kt`, `TrialAdminRepository.kt`
  - Security Infrastructure: `backend/src/main/kotlin/com/medicalsystem/backend/security/MockAuthenticationFilter.kt`, `MockSecurityContextHolder.kt`, `CurrentUserArgumentResolver.kt`, `CurrentUser.kt`

---

## 8. Cross-Cutting Infrastructure & Platform Foundation
Provides common UI component primitives, theme contexts, global error boundaries, database converters, exception mappings, and container deployment infrastructure.

- **Frontend Infrastructure**: `frontend/src/utils/queryClient.ts`, `frontend/src/contexts/SnackbarContext.tsx`, `frontend/src/contexts/ThemeContext.tsx`, `frontend/src/contexts/SidebarContext.tsx`, `frontend/src/mocks/handlers.ts`, `frontend/vite.config.ts`
- **Backend Infrastructure**: `backend/src/main/kotlin/com/medicalsystem/backend/exception/GlobalExceptionHandler.kt`, `DomainExceptions.kt`, `backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt`, `ValueObjectConverters.kt`, `backend/src/main/resources/application.properties`
- **Deployment & Containers**: `docker-compose.yml`, `frontend/Dockerfile`, `backend/Dockerfile`, `.github/workflows/deploy.yml`
