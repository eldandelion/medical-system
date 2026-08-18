package com.medicalsystem.backend.dto

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
    val subtitle: String? = null,
    val description: String? = null,
    val questions: List<AssessmentQuestionDto>
)

data class AssessmentCatalogItemDto(
    val batteryCode: String,
    val title: String,
    val subtitle: String? = null,
    val description: String? = null,
    val duration: String,
    val questionCount: Int,
    val sections: List<AssessmentSectionDto>,
    val isEnabled: Boolean = true
)

data class AssignedByDto(
    val name: String,
    val initial: String
)

data class AssessmentListItemDto(
    val id: Long,
    val title: String,
    val subtitle: String?,
    val batteryCode: String,
    val assignedBy: AssignedByDto,
    val type: String = "测试",
    val completionPercentage: Int,
    val duration: String,
    val status: AssessmentStatus,
    val assignedAt: LocalDateTime,
    val completedAt: LocalDateTime?,
    val dueDate: LocalDate?
)

data class AssessmentDetailsDto(
    val id: Long,
    val title: String,
    val subtitle: String?,
    val batteryCode: String,
    val assignedBy: AssignedByDto,
    val duration: String,
    val status: AssessmentStatus,
    val sections: List<AssessmentSectionDto>,
    val requiredQuestionIds: List<String>,
    val savedAnswers: Map<String, Int>? = null
)

data class AssignAssessmentRequest(
    @field:NotNull(message = "studentId is required")
    val studentId: Long,
    @field:NotEmpty(message = "batteryCodes cannot be empty")
    val batteryCodes: List<String>,
    val dueDate: LocalDate? = null
)

data class AssignCohortAssessmentRequest(
    val majorId: Long? = null,
    val collegeId: Long? = null,
    val academicYear: Int? = null,
    @field:NotEmpty(message = "batteryCodes cannot be empty")
    val batteryCodes: List<String>,
    val dueDate: LocalDate? = null
)

data class BatchAssignResultDto(
    val assignedCount: Int
)

data class AnswerSubmissionDto(
    @field:NotEmpty(message = "questionId is required")
    val questionId: String,
    @field:NotNull(message = "selectedValue is required")
    val selectedValue: Int
)

data class SubmitAssessmentRequest(
    @field:NotEmpty(message = "answers cannot be empty")
    val answers: List<AnswerSubmissionDto>
)

data class AssessmentSubmissionResponseDto(
    val success: Boolean,
    val assignmentId: Long,
    val totalQuestionsAnswered: Int,
    val completedAt: LocalDateTime
)

data class RecordProgressRequest(
    val answers: Map<String, Int>
)
