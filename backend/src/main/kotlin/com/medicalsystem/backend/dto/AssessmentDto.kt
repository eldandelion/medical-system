package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AssessmentStatus
import jakarta.validation.constraints.NotEmpty
import jakarta.validation.constraints.NotNull
import java.time.LocalDate
import java.time.LocalDateTime

data class AssessmentOptionDto(
    val value: Any,
    val label: String,
    val hasTextInput: Boolean = false,
    val textInputPlaceholder: String? = null,
    val textInputLabel: String? = null
)

data class AssessmentQuestionDto(
    val id: String,
    val text: String,
    val orderNum: Int? = null,
    val type: String = "single_choice",
    val field: String? = null,
    val placeholder: String? = null,
    val min: Double? = null,
    val max: Double? = null,
    val step: Double? = null,
    val unit: String? = null,
    val minLabel: String? = null,
    val maxLabel: String? = null,
    val icon: String? = null,
    val zeroOptionLabel: String? = null,
    val sectionCode: String? = null,
    val sectionTitle: String? = null,
    val options: List<AssessmentOptionDto>? = null
)

data class AssessmentSectionDto(
    val id: String,
    val title: String,
    val subtitle: String? = null,
    val description: String? = null,
    val questionCount: Int = 0,
    val orderNum: Int = 0,
    val questions: List<AssessmentQuestionDto> = emptyList()
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
    val savedAnswers: Map<String, Any>? = null,
    val questions: List<AssessmentQuestionDto>? = null
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
    val selectedValue: Any
)

data class SubmitAssessmentRequest(
    val answers: Any? = null
)

data class AssessmentSubmissionResponseDto(
    val success: Boolean,
    val assignmentId: Long,
    val totalQuestionsAnswered: Int,
    val completedAt: LocalDateTime
)

data class RecordProgressRequest(
    val answers: Map<String, Any>
)


data class SaveDraftRequest(
    val answers: Map<String, Any>,
    val updatedAt: Long = System.currentTimeMillis()
)

data class ScaleDraftDto(
    val scaleCode: String,
    val answers: Map<String, Any>,
    val updatedAt: Long
)
