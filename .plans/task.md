# Implementation Plan: Mobile Intake & Medical System Unified Monorepo Integration

## Overview
This plan defines the step-by-step execution to integrate `/Volumes/Files/Programming/mobile-intake` into `/Volumes/Files/Programming/medical-system`. It establishes a unified monorepo where the mobile-first intake SPA lives under `/mobile`, consuming the Spring Boot Kotlin REST API (`http://localhost:8080`) backed by MySQL 8. Fragmented legacy scales are replaced by the single 377-question, 30-subscale comprehensive milestone survey (`comprehensive_student_intake_survey`), students authenticate via unified dual login (student number or phone + password/SMS OTP), and in-progress survey drafts are synced to `scale_drafts` with automatic acute risk escalation (`ghq_22=1`) notifying Head Councillors.

---

## 1. Writable Files
The execution is strictly confined to the following files:

### Mobile Frontend Files:
- `mobile/**` (All frontend source, public assets, and config copied from `/Volumes/Files/Programming/mobile-intake/frontend`)
- `mobile/vite.config.ts` (Configured with proxy `/api -> http://localhost:8080`)
- `mobile/src/api/intakeApi.ts` (API client aligned with Spring Boot endpoints)
- `mobile/src/contexts/AssessmentContext.tsx` (Assignment hydration from `/api/assessments`)
- `mobile/package.json`

### Backend Resources & Configuration:
- `backend/pom.xml` (Dependencies: `spring-security-crypto`, `jjwt`, `caffeine`, `aliyun-dysmsapi`, `aliyun-dypnsapi`)
- `backend/src/main/resources/application.properties` (Aliyun SMS, JWT secrets, database settings)
- `backend/src/main/resources/assessments/assessment_groups.json` (Single `comprehensive_student_intake_survey`)
- `backend/src/main/resources/assessments/shared_option_groups.json`
- `backend/src/main/resources/assessments/demographics_survey.json`
- `backend/src/main/resources/assessments/general_health_screener.json`
- `backend/src/main/resources/assessments/phq_9.json`
- `backend/src/main/resources/assessments/gad_7.json`
- `backend/src/main/resources/assessments/sleep_disorder.json`
- `backend/src/main/resources/assessments/life_events.json`
- `backend/src/main/resources/assessments/peer_relationship.json`
- `backend/src/main/resources/assessments/teacher_relationship.json`
- `backend/src/main/resources/assessments/aggression.json`
- `backend/src/main/resources/assessments/impulsivity.json`
- `backend/src/main/resources/assessments/childhood_ses.json`
- `backend/src/main/resources/assessments/self_control.json`
- `backend/src/main/resources/assessments/loneliness.json`
- `backend/src/main/resources/assessments/childhood_trauma.json`
- `backend/src/main/resources/assessments/apq_9_father.json`
- `backend/src/main/resources/assessments/apq_9_mother.json`
- `backend/src/main/resources/assessments/nssi.json`
- `backend/src/main/resources/assessments/social_support.json`
- `backend/src/main/resources/assessments/emotion_regulation.json`
- `backend/src/main/resources/assessments/grit.json`
- `backend/src/main/resources/assessments/coping_styles.json`
- `backend/src/main/resources/assessments/swls.json`
- `backend/src/main/resources/assessments/mobile_addiction.json`
- `backend/src/main/resources/assessments/game_addiction.json`
- `backend/src/main/resources/assessments/pq16.json`
- `backend/src/main/resources/assessments/adhd.json`
- `backend/src/main/resources/assessments/big_five.json`
- `backend/src/main/resources/assessments/brief_a.json`
- `backend/src/main/resources/assessments/procrastination.json`
- `backend/src/main/resources/assessments/eating_habits.json`

### Backend Domain Models, Entities & Repositories:
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScale.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/model/StudentHealthProfile.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/UserEntity.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentEntity.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentHealthProfileEntity.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/ScaleDraftEntity.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/UserJpaRepository.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepository.kt`

### Backend Services, Security, Config, DTOs & Mappers:
- `backend/src/main/kotlin/com/medicalsystem/backend/config/AssessmentCatalogLoader.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/config/DataInitializer.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentMapper.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/security/JwtService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/security/MockAuthenticationFilter.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDto.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/dto/AuthDtos.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/sms/SmsSender.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/infrastructure/sms/MockSmsSender.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/infrastructure/sms/AliyunSmsSender.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/infrastructure/sms/AliyunSmsProperties.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/OtpService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/AuthService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/DemographicsProjector.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/service/ClinicalRiskEvaluator.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/AuthController.kt`
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/AssessmentController.kt`

### Test Suites:
- `backend/src/test/kotlin/com/medicalsystem/backend/config/AssessmentCatalogLoaderTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/repository/ScaleDraftJpaRepositoryTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/OtpServiceTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/controller/StudentAuthControllerTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentDraftIntegrationTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/ClinicalRiskEvaluatorTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/repository/AssessmentRepositoryAdapterTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt`
- `backend/src/test/kotlin/com/medicalsystem/backend/event/AssessmentCompletedListenerTest.kt`
- `frontend/src/constants/assessmentDictionary.ts`
- `docker-compose.yml`
- `.plans/task.md`

---

## 2. Test-Driven Development (TDD) Specifications

### Test Suite 1: Catalog Parsing (`AssessmentCatalogLoaderTest.kt`)
- `testLoadComprehensiveSurvey_Success`: Load `assessment_groups.json` and all 30 scale files. Assert `comprehensive_student_intake_survey` is present.
- `testTotalQuestionCountEquals377`: Assert `totalQuestions == 377` across all 30 subscales.
- `testPolymorphicQuestions`: Assert question types (`text`, `single_choice`, `number`, `slider`, `date`) and properties (`min`, `max`, `unit`, `step`, `options` with text inputs) load correctly.
- `testOptionGroupResolution`: Assert option groups like `FOUR_POINT_FREQUENCY` resolve cleanly.

### Test Suite 2: Draft Persistence (`ScaleDraftJpaRepositoryTest.kt`)
- `testSaveAndRetrieveDraft`: Save draft answers JSON for a student; verify retrieval by `(studentId, scaleCode)`.
- `testUniqueConstraint`: Verify `uk_student_scale` prevents duplicate draft rows for the same student and scale.
- `testDeleteDraft`: Verify deletion upon survey submission.
- `testUserEntityFields`: Verify `phone` and `passwordHash` persist and query cleanly via H2.

### Test Suite 3: OTP Service (`OtpServiceTest.kt`)
- `testSendOtp_ReturnsDevCodeInMockMode`: Verify `devCode` is present when Aliyun SMS is disabled.
- `testSendOtp_CooldownEnforced`: Subsequent send within 60 seconds throws `ValidationException`.
- `testVerifyOtp_ValidCode`: Code matches; `consume=true` removes from cache.
- `testVerifyOtp_ExpiredOrInvalid`: Wrong code increments failure count; 5 failures invalidates OTP.

### Test Suite 4: Student Auth & Registration (`StudentAuthControllerTest.kt`)
- `testStudentRegister_Success`: Register with student number, phone, password, and OTP. Creates `UserEntity(role=STUDENT)` + `StudentEntity` + initial `StudentHealthProfile` + assigns `comprehensive_student_intake_survey`. Returns valid JWT.
- `testStudentRegister_DuplicateIdentifier`: Returns `409 CONFLICT` when student number or phone already exists.
- `testDualLogin_StudentNumber`: Login with student number and password returns 200 + JWT.
- `testDualLogin_Phone`: Login with phone and password returns 200 + JWT.
- `testLogin_InvalidPassword`: Returns `401 UNAUTHORIZED`.

### Test Suite 5: Draft & Assessment Integration (`AssessmentDraftIntegrationTest.kt`)
- `testPutDraft_SavesAndUpdatesProgress`: `PUT /api/assessments/{id}/draft` updates `scale_drafts` and updates assignment progress percentage.
- `testGetDraft_HydratesAnswers`: `GET /api/assessments/{id}/draft` returns existing saved answers.
- `testSubmitSurvey_PurgesDraftAndProjectsDemographics`: Submitting completes assignment, purges draft from DB, projects demographics to `StudentDemographicsEntity`, and triggers risk evaluation.

### Test Suite 6: Clinical Risk Evaluation (`ClinicalRiskEvaluatorTest.kt`)
- `testAcuteSuicidalIdeation_AlertsHeadCouncillor`: `ghq_22 = 1` or `phq9_9 >= 1` escalates profile risk to `HIGH`, appends `SUICIDAL_IDEATION` risk flag, and inserts `ASSESSMENT_HIGH_RISK_ALERT_HC` notification for all Head Councillors.
- `testSuicideAttemptHistory`: `ghq_23 = 1` adds `SUICIDE_ATTEMPT` flag and escalates risk to `HIGH`.
- `testHighDepressionScore`: PHQ-9 >= 15 escalates to `HIGH`.
- `testMediumDepressionScore`: PHQ-9 >= 10 escalates to `MEDIUM`.
- `testNormalScore_LowRisk`: Normal responses result in `LOW` risk with no Head Councillor notifications.

---

## 3. Step-by-Step Execution Order

### Step 1: Copy Mobile Frontend & Configure Vite Proxy
- Copy `/Volumes/Files/Programming/mobile-intake/frontend` into `medical-system/mobile`.
- Configure `mobile/vite.config.ts` with proxy `/api -> http://localhost:8080`.
- Verify `mobile/package.json`.

### Step 2: Copy Assessment Scales & Catalog JSONs
- Copy the 30 subscale JSON files from `/Volumes/Files/Programming/mobile-intake/backend/src/main/resources/assessments/` to `/Volumes/Files/Programming/medical-system/backend/src/main/resources/assessments/`.
- Copy `assessment_groups.json` and `shared_option_groups.json`.
- In `frontend/src/constants/assessmentDictionary.ts`, register `'comprehensive_student_intake_survey': '中南大学学生心身健康综合调查问卷'`.

### Step 3: Polymorphic Question Schema & 377-Question Loader
- Update `AssessmentScale.kt`, `AssessmentCatalogLoader.kt`, `AssessmentDto.kt`, `AssessmentMapper.kt`.
- Run & verify `AssessmentCatalogLoaderTest.kt` asserting all 30 subscales and exactly 377 questions load cleanly.

### Step 4: User Credentials & Scale Draft JPA Entity
- Update `UserEntity.kt` with `phone` and `passwordHash`.
- Update `UserJpaRepository.kt` with `findByPhone`.
- Create `ScaleDraftEntity.kt` and `ScaleDraftJpaRepository.kt`.
- Write and run `ScaleDraftJpaRepositoryTest.kt`.

### Step 5: OTP Service, Student Self-Registration & Dual Login
- Update `backend/pom.xml` with dependencies (`spring-security-crypto`, `caffeine`, `jjwt`, `aliyun-dysmsapi`, `aliyun-dypnsapi`).
- Implement `SmsSender`, `MockSmsSender`, `AliyunSmsSender`, `AliyunSmsProperties`.
- Implement `OtpService.kt` and `JwtService.kt`.
- Update `MockAuthenticationFilter.kt` to resolve JWT Bearer tokens.
- Add student registration (`POST /api/auth/student-register`) and dual login (`POST /api/auth/login`) in `AuthController.kt` / `AuthService.kt`.
- Write and run `OtpServiceTest.kt` and `StudentAuthControllerTest.kt`.

### Step 6: Draft Persistence & Survey Submission
- Implement `ScaleDraftService.kt` (get, save, delete, progress calculation).
- Implement draft and submission endpoints in `AssessmentController.kt` / `AssessmentService.kt`.
- Implement `DemographicsProjector.kt` for demographic projection upon completion.
- Write and run `AssessmentDraftIntegrationTest.kt`.

### Step 7: Extensible Clinical Risk Evaluator Boilerplate
- Implement `ClinicalRiskEvaluator.kt` (detecting `ghq_22=1`, `ghq_23=1`, `phq9_9>=1`, PHQ-9/GAD-7 scoring).
- Call `profile.escalateRisk` and dispatch `ASSESSMENT_HIGH_RISK_ALERT_HC` to Head Councillors.
- Update `DataInitializer.kt` and existing test fixtures.
- Write and run `ClinicalRiskEvaluatorTest.kt`.

### Step 8: Update Mobile API Client
- In `mobile/src/api/intakeApi.ts`: point auth and assessment requests to Spring Boot endpoints.
- Ensure auth header attaches `Authorization: Bearer ${token}`.
- Verify mobile unit tests pass.

### Step 9: Full Monorepo Verification & Quality Gate
- Run backend tests: `./mvnw test`.
- Run desktop frontend tests: `cd frontend && npm run lint && npm test`.
- Run mobile frontend tests: `cd mobile && npm run lint && npm test`.
- Run production builds for both frontends and backend package.

---

## 4. Acceptance Criteria
- [x] Mobile intake code resides in `/mobile` with proxy target `http://localhost:8080`.
- [x] All 30 scale JSON files, `assessment_groups.json`, and `shared_option_groups.json` load into `comprehensive_student_intake_survey` (377 questions).
- [x] `UserEntity` persists `phone` and `passwordHash` (BCrypt); `ScaleDraftEntity` persists survey drafts in MySQL.
- [x] `POST /api/auth/send-code` dispatches OTP; `POST /api/auth/student-register` registers student and assigns intake survey.
- [x] `POST /api/auth/login` authenticates via studentNumber or phone + password.
- [x] `PUT /api/assessments/{id}/draft` saves drafts and calculates progress; `GET /api/assessments/{id}/draft` retrieves saved answers.
- [x] `POST /api/assessments/{id}/submit` completes the assignment, purges the draft, projects demographics, and triggers risk triage.
- [x] `ClinicalRiskEvaluator` detects `ghq_22=1`, escalates profile risk to `HIGH`, appends risk flags, and alerts Head Councillors.
- [x] Mobile intake client seamlessly communicates with backend APIs.
- [x] `./mvnw test` passes 100% with 0 failures.
- [x] `npm run lint` and `npm test` pass across both `frontend/` and `mobile/`.
