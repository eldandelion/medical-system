package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.AssessmentScale
import com.medicalsystem.backend.model.AssessmentStatus

object AssessmentMapper {
    const val DEFAULT_ASSIGNER_NAME = "心理中心"
    const val DEFAULT_ASSIGNER_INITIAL = "心"
    const val ASSESSMENT_TYPE = "测试"

    fun AssessmentAssignment.toListItemDto(scale: AssessmentScale?, assignerName: String?): AssessmentListItemDto {
        val finalAssignerName = assignerName ?: DEFAULT_ASSIGNER_NAME
        val initial = if (finalAssignerName.isNotBlank()) finalAssignerName.take(1) else DEFAULT_ASSIGNER_INITIAL
        val percentage = if (this.status == AssessmentStatus.COMPLETED) 100 else 0

        return AssessmentListItemDto(
            id = this.id ?: 0L,
            title = scale?.title ?: this.scaleType.name,
            subtitle = scale?.subtitle,
            scaleType = this.scaleType,
            assignedBy = AssignedByDto(
                name = finalAssignerName,
                initial = initial
            ),
            type = ASSESSMENT_TYPE,
            completionPercentage = percentage,
            duration = scale?.duration ?: "10 分钟",
            status = this.status,
            assignedAt = this.assignedAt,
            completedAt = this.completedAt,
            dueDate = this.dueDate
        )
    }

    fun AssessmentScale.toDetailsDto(assignment: AssessmentAssignment, assignerName: String?): AssessmentDetailsDto {
        val finalAssignerName = assignerName ?: DEFAULT_ASSIGNER_NAME
        val initial = if (finalAssignerName.isNotBlank()) finalAssignerName.take(1) else DEFAULT_ASSIGNER_INITIAL
        
        val sectionDtos = this.sections.map { sec ->
            AssessmentSectionDto(
                id = sec.code,
                title = sec.title,
                subtitle = sec.subtitle,
                description = sec.description,
                questions = sec.questions.map { q ->
                    AssessmentQuestionDto(
                        id = q.code,
                        text = q.text,
                        options = q.effectiveOptions.map { opt ->
                            AssessmentOptionDto(value = opt.value, label = opt.label)
                        }
                    )
                }
            )
        }

        return AssessmentDetailsDto(
            id = assignment.id ?: 0L,
            title = this.title,
            subtitle = this.subtitle,
            scaleType = assignment.scaleType,
            assignedBy = AssignedByDto(
                name = finalAssignerName,
                initial = initial
            ),
            duration = this.duration,
            status = assignment.status,
            sections = sectionDtos,
            requiredQuestionIds = this.allQuestionCodes.toList()
        )
    }

    fun AssessmentScale.toCatalogItemDto(): AssessmentCatalogItemDto {
        return AssessmentCatalogItemDto(
            scaleType = this.scaleType,
            title = this.title,
            subtitle = this.subtitle,
            description = this.description,
            duration = this.duration,
            questionCount = this.totalQuestions,
            sections = this.sections.map { sec ->
                AssessmentSectionDto(
                    id = sec.code,
                    title = sec.title,
                    subtitle = sec.subtitle,
                    description = sec.description,
                    questions = sec.questions.map { q ->
                        AssessmentQuestionDto(
                            id = q.code,
                            text = q.text,
                            options = q.effectiveOptions.map { opt ->
                                AssessmentOptionDto(value = opt.value, label = opt.label)
                            }
                        )
                    }
                )
            }
        )
    }
}
