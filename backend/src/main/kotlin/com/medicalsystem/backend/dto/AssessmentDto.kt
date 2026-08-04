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
    val status: AssessmentStatus,
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
