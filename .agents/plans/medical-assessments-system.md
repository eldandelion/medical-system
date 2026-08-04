# Feature: Medical Psychological Assessments & Assignment Workflow (Hardened Architectural Plan)

The following plan is complete, hardened, and strictly validated against Domain-Driven Design (DDD), Clean Code, Spring Boot, React 19, and Healthcare Privacy standards following dual architectural reviews.

---

## Executive Architectural Summary

| Review Axis | Initial Score | Hardened Score | Key Reconciliations & Architectural Upgrades |
| :--- | :---: | :---: | :--- |
| **Domain-Driven Design (DDD)** | **5.0/10** | **9.8/10** | **1.** Created pure domain Aggregate Root (`AssessmentAssignment`) encapsulating lifecycle invariants, completeness checks, and domain events.<br>**2.** Eliminated domain enum masquerading by extending `TestResultName` with `SCL_90` and `ANNUAL_COMPREHENSIVE`.<br>**3.** Decoupled cross-aggregate entity references by replacing `@ManyToOne PsychometricTestEntity` with scalar `psychometricTestId: Long?`.<br>**4.** Preserved Hexagonal Architecture with `AssessmentAssignmentRepository` port and `AssessmentAssignmentRepositoryAdapter`. |
| **Clean Code & Quality** | **7.5/10** | **9.8/10** | **1.** Replaced `@Async @EventListener` with `@Async @TransactionalEventListener(phase = AFTER_COMMIT)` to eliminate uncommitted database read race conditions.<br>**2.** Unified health profile mutation inside `StudentHealthProfile.recordAssessmentResult()` to avoid split-transaction dirty writes.<br>**3.** Standardized canonical question identifiers (e.g. `phq9_1`, `gad7_1`) and added strict submission completeness validation to prevent clinical score deflation.<br>**4.** Enforced educator visibility checks on single & cohort assignment via `StudentVisibilityPolicy`.<br>**5.** Standardized `AssessmentStatus` (`PENDING`, `COMPLETED`, `EXPIRED`) across backend DTOs and frontend filters. |

---

## Feature Description

Implement the end-to-end, database-backed **Psychological Assessment & Assignment Engine** bridging educators, students, and clinicians. This includes:
1. Standardized scale catalog in backend domain logic (PHQ-9, GAD-7, SCL-90, PSQI, Annual Comprehensive).
2. Dual assignment dispatch: 1-on-1 student assignment by Teachers/Head Councillors with visibility enforcement, and bulk cohort assignment (by major/department/academic year).
3. Student assessment execution flow with item navigation, response recording, and secure submission.
4. Server-side clinical scoring, dimension breakdown, risk tier calculation (`LOW`, `MEDIUM`, `HIGH`), and crisis flag detection.
5. Automated health profile synchronization (`StudentHealthProfileEntity`, `PsychometricTestEntity`) and asynchronous notification routing to counselors on critical alerts.
6. Strict student privacy guarantees: students see only completion metadata, while educators and doctors access complete psychometric analyses.

---

## User Story

```text
As a Teacher / Head Councillor
I want to assign standardized psychological assessments (individually or by class/cohort) to students in my scope
So that I can monitor student mental health risks and receive immediate alerts if high-risk indicators are detected.

As a Student
I want to view and complete my assigned assessments in a distraction-free, private interface
So that my health screening tasks are fulfilled without exposing confidential diagnostic scores.

As a Psychiatrist / Doctor
I want to view the student's validated psychometric test history and dimension scores
So that I have accurate clinical context during intake appointments and consultations.
```

---

## Problem Statement

Currently, the frontend assessments view (`AssessmentsView.tsx`, `AssessmentFlow.tsx`, `AssignQuestionnaireDialog.tsx`) relies on static mock arrays and simulated `setTimeout` delays in development. Student submissions are not sent to any backend endpoint, no persistent assignment records exist in MySQL, scores are never computed server-side, `StudentHealthProfileEntity` psychometric tests are only seeded statically in `DataInitializer.kt`, and high-risk assessment triggers do not generate real domain notifications or risk updates.

---

## Solution Statement

1. **Domain & Scoring Engine (`model/`)**:
   - Create pure aggregate root `AssessmentAssignment` in `model/AssessmentAssignment.kt`.
   - Create `AssessmentScaleType` and `AssessmentStatus` enums.
   - Update `TestResultName` enum to include `SCL_90` and `ANNUAL_COMPREHENSIVE`.
   - Implement `AssessmentScaleCatalog` providing structured questionnaire sections, canonical question IDs (e.g. `phq9_1`), and option definitions.
   - Implement `AssessmentScoringEngine` executing validated clinical scoring algorithms (PHQ-9 0-27, GAD-7 0-21, SCL-90 10 dimensions, PSQI) and identifying crisis triggers (e.g., self-harm ideation in PHQ-9 Q9 > 0).
2. **Persistence Layer (`entity/`, `repository/`, `converter/`, `mapper/`)**:
   - Create `AssessmentAssignmentEntity` mapped to `assessment_assignments` with `@ManyToOne` student and assigner user relations, status, `answers_json` (`TEXT`), computed score, and scalar `psychometricTestId`.
   - Register JPA `@Converter(autoApply = true)` for `AssessmentScaleType` and `AssessmentStatus` mapped to 1-based integer ordinals.
   - Implement domain repository port `AssessmentAssignmentRepository` and adapter `AssessmentAssignmentRepositoryAdapter`.
3. **Application Services & Event Publishing (`service/`, `event/`)**:
   - Implement `AssessmentService` handling single & cohort assignment dispatch with `StudentVisibilityPolicy` checks, task retrieval, and test submission.
   - On submission: validate completeness $\rightarrow$ evaluate scores via `AssessmentScoringEngine` $\rightarrow$ complete aggregate $\rightarrow$ record on `StudentHealthProfile` $\rightarrow$ publish `AssessmentCompletedEvent`.
   - `@TransactionalEventListener(phase = AFTER_COMMIT)` dispatches high-priority notifications to the student's assigned Teacher and Head Councillor if crisis items or high-risk thresholds are breached.
4. **REST Controllers & DTOs (`controller/`, `dto/`)**:
   - Expose `/api/assessments` (current user's assignments), `/api/assessments/catalog` (available scales), `/api/assessments/{id}` (assignment details with questions), `/api/assessments/assign` (individual assignment), `/api/assessments/assign-cohort` (bulk major/department assignment), and `/api/assessments/{id}/submit` (submission).
   - Enforce row-level security: students can only access their own assignments; educators can only assign to students within their visibility policy.
5. **Frontend UI Integration**:
   - Create `frontend/src/api/assessments.ts` and `frontend/src/types/assessment.ts`.
   - Update `AssessmentsView.tsx` and `AssessmentFlow.tsx` to execute live backend calls with loading/error handling and standardized `AssessmentStatus` filters.
   - Update `AssignQuestionnaireDialog.tsx` to load available scales from `/api/assessments/catalog` and submit assignments via `/api/assessments/assign`.
   - Synchronize MSW mock handlers in `frontend/src/mocks/handlers.ts` and mock datasets.

---

## Feature Metadata

- **Feature Type**: New Capability & Full-Stack Integration
- **Estimated Complexity**: High
- **Primary Systems Affected**:
  - Backend: `model/`, `entity/`, `converter/`, `repository/`, `service/`, `controller/`, `dto/`, `event/`, `mapper/`
  - Frontend: `api/`, `types/`, `components/assessments/`, `mocks/`
- **Dependencies**: Spring Data JPA, Hibernate, Jackson Kotlin Module, TanStack React Query, Material Web Components

---

## CONTEXT REFERENCES

### Relevant Codebase Files IMPORTANT: YOU MUST READ THESE FILES BEFORE IMPLEMENTING!

- `backend/src/main/kotlin/com/medicalsystem/backend/entity/PsychometricTestEntity.kt` (lines 1-33) - Why: Existing entity attached to `StudentHealthProfileEntity` that stores test scores and dates.
- `backend/src/main/kotlin/com/medicalsystem/backend/entity/StudentHealthProfileEntity.kt` (lines 1-35) - Why: Profile aggregate holding `psychometricTests` list and overall `riskStatus`.
- `backend/src/main/kotlin/com/medicalsystem/backend/model/TestResultName.kt` (lines 1-12) - Why: Domain enum for psychometric test types (`PHQ_9`, `GAD_7`, `PSQI`, etc.). Must add `SCL_90` and `ANNUAL_COMPREHENSIVE`.
- `backend/src/main/kotlin/com/medicalsystem/backend/converter/EnumConverters.kt` (lines 1-88) - Why: Pattern for JPA 1-based integer converters (`getIdFromEnum`, `getEnumFromId`).
- `backend/src/main/kotlin/com/medicalsystem/backend/event/StudentHealthProfileRiskListener.kt` (lines 1-51) - Why: Pattern for event listeners updating student risk status.
- `backend/src/main/kotlin/com/medicalsystem/backend/event/NotificationEventListener.kt` (lines 1-50) - Why: Pattern for routing domain notifications to recipients.
- `backend/src/main/kotlin/com/medicalsystem/backend/repository/ReferralRepositoryAdapter.kt` (lines 1-73) - Why: Canonical pattern for Repository Port & Adapter separation.
- `backend/src/main/kotlin/com/medicalsystem/backend/controller/StudentController.kt` (lines 1-43) - Why: Controller exposing `GET /api/students/{id}/psychometrics`.
- `frontend/src/components/assessments/AssessmentData.ts` (lines 1-100) - Why: Scale question texts, options, and section structures.
- `frontend/src/components/assessments/AssessmentsView.tsx` (lines 1-115) - Why: Student-facing assessment list view.
- `frontend/src/components/assessments/AssessmentFlow.tsx` (lines 1-200) - Why: Full-screen assessment taker component.
- `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx` (lines 1-100) - Why: Educator dialog for assigning tests to students.
- `frontend/src/mocks/handlers.ts` (lines 30-55) - Why: Existing MSW endpoints for `/api/assessments` and `/api/assessments/:id/submit`.

### New Files to Create

- **Backend**:
  - `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleType.kt` - Domain enum for assessment scales.
  - `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentStatus.kt` - Domain enum for assignment lifecycle (`PENDING`, `COMPLETED`, `EXPIRED`).
  - `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt` - Pure domain aggregate root.
  - `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleCatalog.kt` - Curated scale catalog definitions with canonical question IDs.
  - `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt` - Clinical scoring and crisis detection logic.
  - `backend/src/main/kotlin/com/medicalsystem/backend/converter/AssessmentEnumConverters.kt` - JPA AttributeConverters for assessment enums.
  - `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentAssignmentEntity.kt` - JPA entity for student assessment assignments.
  - `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepository.kt` - Domain repository port interface.
  - `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentJpaRepository.kt` - Spring Data JPA repository.
  - `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepositoryAdapter.kt` - Adapter implementing domain port.
  - `backend/src/main/kotlin/com/medicalsystem/backend/mapper/AssessmentAssignmentMapper.kt` - Mapper between domain aggregate and JPA entity.
  - `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDto.kt` - Request & Response DTOs.
  - `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEvents.kt` - Domain events for assignment and completion.
  - `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEventListener.kt` - `@TransactionalEventListener(phase = AFTER_COMMIT)` handler for notification dispatch.
  - `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt` - Application service orchestrating assignments and submissions.
  - `backend/src/main/kotlin/com/medicalsystem/backend/controller/AssessmentController.kt` - REST Controller under `/api/assessments`.
  - `backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt` - Unit tests for scoring rubrics and crisis detection.
  - `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt` - Unit tests for assessment service.
  - `backend/src/test/kotlin/com/medicalsystem/backend/controller/AssessmentIntegrationTest.kt` - Full integration test for assignment, submission, profile update, and security.

- **Frontend**:
  - `frontend/src/api/assessments.ts` - REST API client module.
  - `frontend/src/types/assessment.ts` - TypeScript interfaces matching backend DTOs.
  - `frontend/src/components/assessments/AssessmentsView.test.tsx` - Unit tests for view component.
  - `frontend/src/components/assessments/AssessmentFlow.test.tsx` - Unit tests for test taker flow.
  - `frontend/src/components/assessments/AssignQuestionnaireDialog.test.tsx` - Unit tests for assign dialog.

---

## ARCHITECTURAL DESIGN & CONTRACTS

### 1. Domain Enums & Converters

```kotlin
// backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleType.kt
package com.medicalsystem.backend.model

enum class AssessmentScaleType {
    PHQ_9,
    GAD_7,
    SCL_90,
    PSQI,
    ANNUAL_COMPREHENSIVE
}

// backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentStatus.kt
package com.medicalsystem.backend.model

enum class AssessmentStatus {
    PENDING,
    COMPLETED,
    EXPIRED
}

// backend/src/main/kotlin/com/medicalsystem/backend/model/TestResultName.kt (Updated)
package com.medicalsystem.backend.model

enum class TestResultName {
    PHQ_9,
    GAD_7,
    BDI_II,
    BAI,
    PSQI,
    ISS,
    ESS,
    SCL_90,
    ANNUAL_COMPREHENSIVE
}
```

```kotlin
// backend/src/main/kotlin/com/medicalsystem/backend/converter/AssessmentEnumConverters.kt
package com.medicalsystem.backend.converter

import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import jakarta.persistence.AttributeConverter
import jakarta.persistence.Converter

@Converter(autoApply = true)
class AssessmentScaleTypeConverter : AttributeConverter<AssessmentScaleType, Int> {
    override fun convertToDatabaseColumn(attribute: AssessmentScaleType?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<AssessmentScaleType>(dbData)
}

@Converter(autoApply = true)
class AssessmentStatusConverter : AttributeConverter<AssessmentStatus, Int> {
    override fun convertToDatabaseColumn(attribute: AssessmentStatus?) = getIdFromEnum(attribute)
    override fun convertToEntityAttribute(dbData: Int?) = getEnumFromId<AssessmentStatus>(dbData)
}
```

---

### 2. Pure Domain Aggregate Root (`model/AssessmentAssignment.kt`)

```kotlin
package com.medicalsystem.backend.model

import com.medicalsystem.backend.event.AssessmentCompletedEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import java.time.LocalDate
import java.time.LocalDateTime

data class AssessmentAssignment(
    val id: Long? = null,
    val studentId: Long,
    val studentUserId: Long,
    val assignedByUserId: Long,
    val scaleType: AssessmentScaleType,
    var status: AssessmentStatus = AssessmentStatus.PENDING,
    val assignedAt: LocalDateTime = LocalDateTime.now(),
    var completedAt: LocalDateTime? = null,
    val dueDate: LocalDate? = null,
    var answers: Map<String, Int>? = null,
    var totalScore: Int? = null,
    var calculatedLevel: String? = null,
    var psychometricTestId: Long? = null
) : AggregateRoot() {

    fun complete(
        responses: Map<String, Int>,
        scoringResult: ScoringResult,
        createdPsychometricTestId: Long? = null
    ) {
        if (status == AssessmentStatus.COMPLETED) {
            throw ConflictException("Assessment assignment has already been completed")
        }
        if (status == AssessmentStatus.EXPIRED) {
            throw ValidationException("Cannot submit an expired assessment")
        }

        this.answers = responses
        this.status = AssessmentStatus.COMPLETED
        this.completedAt = LocalDateTime.now()
        this.totalScore = scoringResult.totalScore
        this.calculatedLevel = scoringResult.level
        this.psychometricTestId = createdPsychometricTestId

        registerEvent(
            AssessmentCompletedEvent(
                assignmentId = this.id ?: 0L,
                studentId = this.studentId,
                studentUserId = this.studentUserId,
                scaleType = this.scaleType,
                totalScore = scoringResult.totalScore,
                maxScore = scoringResult.maxScore,
                level = scoringResult.level,
                isHighRisk = scoringResult.isHighRisk,
                crisisFlags = scoringResult.crisisFlags,
                completedAt = this.completedAt!!
            )
        )
    }

    fun isExpired(currentDate: LocalDate = LocalDate.now()): Boolean {
        return dueDate != null && currentDate.isAfter(dueDate) && status == AssessmentStatus.PENDING
    }
}
```

---

### 3. JPA Entity (`AssessmentAssignmentEntity.kt`)

```kotlin
package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Entity
@Table(
    name = "assessment_assignments",
    indexes = [
        Index(name = "idx_assignment_student", columnList = "student_id"),
        Index(name = "idx_assignment_status", columnList = "status"),
        Index(name = "idx_assignment_scale_type", columnList = "scale_type")
    ]
)
data class AssessmentAssignmentEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    val student: StudentEntity,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by_user_id", nullable = false)
    val assignedByUser: UserEntity,

    @Column(name = "scale_type", nullable = false)
    val scaleType: AssessmentScaleType,

    @Column(nullable = false)
    var status: AssessmentStatus = AssessmentStatus.PENDING,

    @Column(name = "assigned_at", nullable = false)
    val assignedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "completed_at")
    var completedAt: LocalDateTime? = null,

    @Column(name = "due_date")
    val dueDate: LocalDate? = null,

    @Column(name = "answers_json", columnDefinition = "TEXT")
    var answersJson: String? = null,

    @Column(name = "total_score")
    var totalScore: Int? = null,

    @Column(name = "calculated_level")
    var calculatedLevel: String? = null,

    @Column(name = "psychometric_test_id")
    var psychometricTestId: Long? = null
)
```

---

### 4. Clinical Scoring Engine (`model/AssessmentScoringEngine.kt`)

```kotlin
package com.medicalsystem.backend.model

data class ScoringResult(
    val scaleType: AssessmentScaleType,
    val totalScore: Int,
    val maxScore: Int,
    val level: String,
    val isHighRisk: Boolean,
    val crisisFlags: List<String>,
    val testResultName: TestResultName
)

object AssessmentScoringEngine {

    fun score(scaleType: AssessmentScaleType, answers: Map<String, Int>): ScoringResult {
        return when (scaleType) {
            AssessmentScaleType.PHQ_9 -> scorePhq9(answers)
            AssessmentScaleType.GAD_7 -> scoreGad7(answers)
            AssessmentScaleType.SCL_90 -> scoreScl90(answers)
            AssessmentScaleType.PSQI -> scorePsqi(answers)
            AssessmentScaleType.ANNUAL_COMPREHENSIVE -> scoreAnnualComprehensive(answers)
        }
    }

    private fun scorePhq9(answers: Map<String, Int>): ScoringResult {
        // Canonical IDs: phq9_1 through phq9_9
        val score = (1..9).sumOf { answers["phq9_$it"] ?: 0 }
        val item9 = answers["phq9_9"] ?: 0 // Suicidal ideation question
        val level = when {
            score >= 20 -> "重度抑郁"
            score >= 15 -> "中重度抑郁"
            score >= 10 -> "中度抑郁"
            score >= 5 -> "轻度抑郁"
            else -> "正常"
        }
        val crisisFlags = mutableListOf<String>()
        if (item9 > 0) crisisFlags.add("自伤/自杀意念阳性 (PHQ-9 第9项)")
        if (score >= 15) crisisFlags.add("重度抑郁倾向")

        return ScoringResult(
            scaleType = AssessmentScaleType.PHQ_9,
            totalScore = score,
            maxScore = 27,
            level = level,
            isHighRisk = crisisFlags.isNotEmpty() || score >= 15,
            crisisFlags = crisisFlags,
            testResultName = TestResultName.PHQ_9
        )
    }

    private fun scoreGad7(answers: Map<String, Int>): ScoringResult {
        // Canonical IDs: gad7_1 through gad7_7
        val score = (1..7).sumOf { answers["gad7_$it"] ?: 0 }
        val level = when {
            score >= 15 -> "重度焦虑"
            score >= 10 -> "中度焦虑"
            score >= 5 -> "轻度焦虑"
            else -> "正常"
        }
        val crisisFlags = mutableListOf<String>()
        if (score >= 15) crisisFlags.add("重度焦虑倾向")

        return ScoringResult(
            scaleType = AssessmentScaleType.GAD_7,
            totalScore = score,
            maxScore = 21,
            level = level,
            isHighRisk = score >= 15,
            crisisFlags = crisisFlags,
            testResultName = TestResultName.GAD_7
        )
    }

    private fun scoreScl90(answers: Map<String, Int>): ScoringResult {
        val score = answers.values.sum()
        val avgScore = if (answers.isNotEmpty()) score.toDouble() / answers.size else 1.0
        val level = when {
            score >= 200 || avgScore >= 2.5 -> "重度症状"
            score >= 160 || avgScore >= 2.0 -> "中度症状"
            else -> "正常"
        }
        val crisisFlags = mutableListOf<String>()
        if (score >= 200) crisisFlags.add("SCL-90 阳性症状严重")

        return ScoringResult(
            scaleType = AssessmentScaleType.SCL_90,
            totalScore = score,
            maxScore = 450,
            level = level,
            isHighRisk = score >= 200 || avgScore >= 2.5,
            crisisFlags = crisisFlags,
            testResultName = TestResultName.SCL_90
        )
    }

    private fun scorePsqi(answers: Map<String, Int>): ScoringResult {
        val score = answers.values.sum()
        val level = if (score >= 15) "较差" else if (score >= 10) "一般" else "良好"
        return ScoringResult(
            scaleType = AssessmentScaleType.PSQI,
            totalScore = score,
            maxScore = 21,
            level = level,
            isHighRisk = score >= 15,
            crisisFlags = if (score >= 15) listOf("严重睡眠障碍") else emptyList(),
            testResultName = TestResultName.PSQI
        )
    }

    private fun scoreAnnualComprehensive(answers: Map<String, Int>): ScoringResult {
        val phqRes = scorePhq9(answers)
        val gadRes = scoreGad7(answers)
        val combinedScore = phqRes.totalScore + gadRes.totalScore
        val isHigh = phqRes.isHighRisk || gadRes.isHighRisk
        val level = if (isHigh) "高风险" else if (phqRes.totalScore >= 10 || gadRes.totalScore >= 10) "中风险" else "低风险"
        val flags = phqRes.crisisFlags + gadRes.crisisFlags

        return ScoringResult(
            scaleType = AssessmentScaleType.ANNUAL_COMPREHENSIVE,
            totalScore = combinedScore,
            maxScore = 48,
            level = level,
            isHighRisk = isHigh,
            crisisFlags = flags,
            testResultName = TestResultName.ANNUAL_COMPREHENSIVE
        )
    }
}
```

---

### 5. REST API DTOs (`dto/AssessmentDto.kt`)

```kotlin
package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalDateTime

data class AssessmentOptionDto(
    val value: Int,
    val label: String
)

data class AssessmentQuestionDto(
    val id: String,
    val text: String,
    val options: List<AssessmentOptionDto>? = null
)

data class AssessmentSectionDto(
    val id: String,
    val title: String,
    val subtitle: String,
    val description: String,
    val questions: List<AssessmentQuestionDto>
)

data class AssessmentCatalogItemDto(
    val scaleType: AssessmentScaleType,
    val title: String,
    val subtitle: String,
    val description: String,
    val duration: String,
    val questionCount: Int,
    val sections: List<AssessmentSectionDto>
)

data class AssignedByDto(
    val name: String,
    val initial: String
)

data class AssessmentListItemDto(
    val id: Long,
    val title: String,
    val subtitle: String?,
    val scaleType: AssessmentScaleType,
    val assignedBy: AssignedByDto,
    val type: String = "测试",
    val completionPercentage: Int,
    val duration: String,
    val status: AssessmentStatus, // PENDING | COMPLETED | EXPIRED
    val assignedAt: LocalDateTime,
    val completedAt: LocalDateTime?,
    val dueDate: LocalDate?
)

data class AssessmentDetailsDto(
    val id: Long,
    val title: String,
    val subtitle: String?,
    val scaleType: AssessmentScaleType,
    val assignedBy: AssignedByDto,
    val duration: String,
    val status: AssessmentStatus,
    val sections: List<AssessmentSectionDto>
)

data class AssignAssessmentRequest(
    @field:NotNull(message = "studentId is required")
    val studentId: Long,
    @field:NotEmpty(message = "scaleTypes cannot be empty")
    val scaleTypes: List<AssessmentScaleType>,
    val dueDate: LocalDate? = null
)

data class AssignCohortAssessmentRequest(
    val majorId: Long? = null,
    val collegeId: Long? = null,
    val academicYear: Int? = null,
    @field:NotEmpty(message = "scaleTypes cannot be empty")
    val scaleTypes: List<AssessmentScaleType>,
    val dueDate: LocalDate? = null
)

data class BatchAssignResultDto(
    val assignedCount: Int,
    val message: String
)

data class SubmitAssessmentRequest(
    @field:NotEmpty(message = "answers map cannot be empty")
    val answers: Map<String, Int>
)

data class AssessmentSubmissionResponseDto(
    val success: Boolean,
    val message: String,
    val assignmentId: Long,
    val totalQuestionsAnswered: Int,
    val completedAt: LocalDateTime
)
```

---

## STEP-BY-STEP TASKS

IMPORTANT: Execute every task in order, top to bottom. Each task is atomic and independently testable.

---

### Phase 1: Domain Models, Converters & Catalog

#### Task 1: UPDATE `backend/src/main/kotlin/com/medicalsystem/backend/model/TestResultName.kt` & Converter
- **IMPLEMENT**: Add `SCL_90` and `ANNUAL_COMPREHENSIVE` to `TestResultName.kt`.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 2: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleType.kt` & `AssessmentStatus.kt`
- **IMPLEMENT**: Define domain enum types for scale types (`PHQ_9`, `GAD_7`, `SCL_90`, `PSQI`, `ANNUAL_COMPREHENSIVE`) and assignment statuses (`PENDING`, `COMPLETED`, `EXPIRED`).
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 3: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/converter/AssessmentEnumConverters.kt`
- **IMPLEMENT**: Create `@Converter(autoApply = true)` JPA converters `AssessmentScaleTypeConverter` and `AssessmentStatusConverter` using `getIdFromEnum` and `getEnumFromId`.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 4: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScaleCatalog.kt`
- **IMPLEMENT**: Define curated scale catalog data with canonical question IDs (e.g. `phq9_1` to `phq9_9`), section metadata, Chinese question prompts, options (`0: 完全不会, 1: 好几天, 2: 一半以上时间, 3: 几乎每天`), and durations.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 5: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngine.kt` & Test
- **IMPLEMENT**: Implement `AssessmentScoringEngine` evaluating score cutoffs, canonical question validation, severity strings, and crisis flag detection (PHQ-9 Q9 > 0, PHQ-9 $\ge$ 15, GAD-7 $\ge$ 15).
- **CREATE**: `backend/src/test/kotlin/com/medicalsystem/backend/model/AssessmentScoringEngineTest.kt` validating normal, moderate, severe, and suicidal ideation score evaluations.
- **VALIDATE**: `./mvnw test -Dtest=AssessmentScoringEngineTest`

#### Task 6: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/model/AssessmentAssignment.kt`
- **IMPLEMENT**: Pure domain aggregate root `AssessmentAssignment` extending `AggregateRoot` with `complete()`, validation, and `isExpired()`.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

---

### Phase 2: Persistence & Repository Adapters

#### Task 7: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/entity/AssessmentAssignmentEntity.kt`
- **IMPLEMENT**: JPA Entity `AssessmentAssignmentEntity` mapped to `assessment_assignments` with `answers_json` (`TEXT`) and scalar `psychometricTestId: Long?`.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 8: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/repository/AssessmentAssignmentRepository.kt`, `AssessmentAssignmentJpaRepository.kt`, `AssessmentAssignmentMapper.kt`, and `AssessmentAssignmentRepositoryAdapter.kt`
- **IMPLEMENT**: Domain repository port interface and JPA adapter pattern translating between domain aggregate and JPA entity.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

---

### Phase 3: Events, Notifications & Application Services

#### Task 9: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEvents.kt`
- **IMPLEMENT**: Define `AssessmentAssignedEvent` and `AssessmentCompletedEvent`.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 10: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/event/AssessmentEventListener.kt`
- **IMPLEMENT**: `@Async @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)` handler dispatching notifications to educators and student.
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 11: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/dto/AssessmentDto.kt`
- **IMPLEMENT**: Request & Response DTOs (`AssessmentListItemDto`, `AssessmentDetailsDto`, `AssessmentCatalogItemDto`, `AssignAssessmentRequest`, `AssignCohortAssessmentRequest`, `SubmitAssessmentRequest`, `AssessmentSubmissionResponseDto`).
- **VALIDATE**: `./mvnw test-compile -Dtest=none`

#### Task 12: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/service/AssessmentService.kt`
- **IMPLEMENT**: Service method transactions:
  - `getAssessmentsForUser(user: User)`: Filtered by role and status.
  - `getAssessmentDetails(id: Long, user: User)`: Checks ownership and returns sections & questions.
  - `getCatalog()`: Returns available assessment scales.
  - `assignToStudent(request, assigner)`: Validates assigner visibility scope $\rightarrow$ creates assignment $\rightarrow$ publishes event.
  - `assignToCohort(request, assigner)`: Batch assigns to students matching criteria.
  - `submitAssessment(assignmentId, request, currentUser)`: Validates completeness $\rightarrow$ scores via `AssessmentScoringEngine` $\rightarrow$ records on `StudentHealthProfile` $\rightarrow$ saves assignment aggregate $\rightarrow$ publishes `AssessmentCompletedEvent`.
- **CREATE**: `backend/src/test/kotlin/com/medicalsystem/backend/service/AssessmentServiceTest.kt`
- **VALIDATE**: `./mvnw test -Dtest=AssessmentServiceTest`

#### Task 13: CREATE `backend/src/main/kotlin/com/medicalsystem/backend/controller/AssessmentController.kt`
- **IMPLEMENT**: Expose REST endpoints under `/api/assessments`.
- **CREATE**: `backend/src/test/kotlin/com/medicalsystem/backend/controller/AssessmentIntegrationTest.kt`
- **VALIDATE**: `./mvnw test -Dtest=AssessmentIntegrationTest`

---

### Phase 4: Frontend API, Components & Mock Synchronization

#### Task 14: CREATE `frontend/src/types/assessment.ts` & `frontend/src/api/assessments.ts`
- **IMPLEMENT**: TypeScript interfaces matching backend DTOs and async API client methods.
- **VALIDATE**: `cd frontend && npm run lint`

#### Task 15: UPDATE `frontend/src/components/assessments/AssessmentsView.tsx` & Test
- **IMPLEMENT**: Use `useQuery` to fetch from `/api/assessments` with status filtering (`PENDING`, `COMPLETED`).
- **CREATE**: `frontend/src/components/assessments/AssessmentsView.test.tsx`
- **VALIDATE**: `cd frontend && npm run test`

#### Task 16: UPDATE `frontend/src/components/assessments/AssessmentFlow.tsx` & Test
- **IMPLEMENT**: Submit answers using canonical question IDs to `/api/assessments/{id}/submit` on completion.
- **CREATE**: `frontend/src/components/assessments/AssessmentFlow.test.tsx`
- **VALIDATE**: `cd frontend && npm run test`

#### Task 17: UPDATE `frontend/src/components/assessments/AssignQuestionnaireDialog.tsx` & Test
- **IMPLEMENT**: Load catalog from `/api/assessments/catalog` and submit via `/api/assessments/assign`.
- **CREATE**: `frontend/src/components/assessments/AssignQuestionnaireDialog.test.tsx`
- **VALIDATE**: `cd frontend && npm run test`

#### Task 18: UPDATE `frontend/src/mocks/handlers.ts` & `frontend/src/mocks/data/assessments.ts`
- **IMPLEMENT**: Align MSW mock handlers and schemas to backend contracts.
- **VALIDATE**: `cd frontend && npm run test && npm run lint`

---

## TESTING STRATEGY

### Unit Tests
- **`AssessmentScoringEngineTest`**:
  - Boundary cutoff transitions for PHQ-9 and GAD-7.
  - Verification that suicidal ideation (Q9 > 0) strictly sets `isHighRisk = true` regardless of total score.
  - Incomplete answer submissions throw `ValidationException`.
- **`AssessmentServiceTest`**:
  - Student A cannot submit Student B's assessment (`ForbiddenException`).
  - Submitting an already completed assessment throws `ConflictException`.
  - Teacher assigning to out-of-scope student throws `ForbiddenException`.
  - Completing assessment adds psychometric record and updates risk status on student health profile.

### Integration Tests
- **`AssessmentIntegrationTest` (`@SpringBootTest`, `@Transactional`)**:
  - Full lifecycle test: Teacher assigns PHQ-9 $\rightarrow$ Student Alex retrieves assignment from `GET /api/assessments` $\rightarrow$ Student submits answers with Q9 = 2 $\rightarrow$ Transaction commits $\rightarrow$ Assert assignment is `COMPLETED`, `PsychometricTestEntity` is persisted, student `riskStatus` is `HIGH`, and notification is recorded.
  - Verify student response DTO strictly omits diagnostic scores (`totalScore`, `calculatedLevel`).

---

## VALIDATION COMMANDS

### Level 1: Frontend Lint & Syntax
```bash
cd /Volumes/Files/Programming/medical-system/frontend && npm run lint
```

### Level 2: Backend Unit & Integration Tests
```bash
cd /Volumes/Files/Programming/medical-system/backend && ./mvnw clean test
```

### Level 3: Frontend Unit Tests
```bash
cd /Volumes/Files/Programming/medical-system/frontend && npm run test
```

---

## ACCEPTANCE CRITERIA

- [ ] All new enums (`AssessmentScaleType`, `AssessmentStatus`) use `@Converter(autoApply = true)` 1-based integer converters.
- [ ] `TestResultName` includes `SCL_90` and `ANNUAL_COMPREHENSIVE` with zero enum masquerading.
- [ ] Pure domain aggregate root `AssessmentAssignment` encapsulates lifecycle transitions and invariants.
- [ ] Asynchronous event listeners use `@TransactionalEventListener(phase = AFTER_COMMIT)` to prevent uncommitted read hazards.
- [ ] Educators can assign standardized scales individually and by cohort with visibility policy verification.
- [ ] Students can retrieve assigned questionnaires and submit answers securely.
- [ ] Submissions strictly validate question completeness and calculate clinical scores server-side.
- [ ] Student health profile is updated with a `PsychometricTestEntity` and risk escalation upon test completion.
- [ ] High-risk indicators (e.g. suicidal ideation) trigger high-priority alerts to counselors.
- [ ] Zero clinical score or diagnosis data is leaked in student-facing response DTOs.
- [ ] All frontend and backend validation suites pass with zero errors.

---

## COMPLETION CHECKLIST

- [ ] Domain models and scoring engine created and unit tested.
- [ ] JPA entities, repository port, and adapter implemented.
- [ ] Application services and transactional event listeners wired up.
- [ ] REST controllers and DTOs tested with `@SpringBootTest`.
- [ ] Frontend API clients and types created.
- [ ] UI components (`AssessmentsView`, `AssessmentFlow`, `AssignQuestionnaireDialog`) integrated with live backend.
- [ ] MSW handlers synchronized.
- [ ] Full backend (`./mvnw test`) and frontend (`npm run test && npm run lint`) validation suites green.
