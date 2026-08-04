package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.CatalogScaleDefinition
import com.medicalsystem.backend.model.AssessmentStatus

object AssessmentMapper {
    const val DEFAULT_ASSIGNER_NAME = "心理中心"
    const val DEFAULT_ASSIGNER_INITIAL = "心"
    const val ASSESSMENT_TYPE = "测试"

    fun AssessmentAssignment.toListItemDto(scale: CatalogScaleDefinition, assignerName: String?): AssessmentListItemDto {
        val finalAssignerName = assignerName ?: DEFAULT_ASSIGNER_NAME
        val initial = if (finalAssignerName.isNotBlank()) finalAssignerName.take(1) else DEFAULT_ASSIGNER_INITIAL
        val percentage = if (this.status == AssessmentStatus.COMPLETED) 100 else 0

        return AssessmentListItemDto(
            id = this.id ?: 0L,
            title = scale.title,
            subtitle = scale.subtitle,
            scaleType = this.scaleType,
            assignedBy = AssignedByDto(
                name = finalAssignerName,
                initial = initial
            ),
            type = ASSESSMENT_TYPE,
            completionPercentage = percentage,
            duration = scale.duration,
            status = this.status,
            assignedAt = this.assignedAt,
            completedAt = this.completedAt,
            dueDate = this.dueDate
        )
    }

    fun CatalogScaleDefinition.toDetailsDto(assignment: AssessmentAssignment, assignerName: String?): AssessmentDetailsDto {
        val finalAssignerName = assignerName ?: DEFAULT_ASSIGNER_NAME
        val initial = if (finalAssignerName.isNotBlank()) finalAssignerName.take(1) else DEFAULT_ASSIGNER_INITIAL
        
        val sections = this.sections.map { sec ->
            AssessmentSectionDto(
                id = sec.id,
                title = sec.title,
                subtitle = sec.subtitle,
                description = sec.description,
                questions = sec.questions.map { q ->
                    AssessmentQuestionDto(
                        id = q.id,
                        text = q.text,
                        options = q.options?.map { opt ->
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
            sections = sections,
            requiredQuestionIds = this.allQuestionIds.toList()
        )
    }

    fun CatalogScaleDefinition.toCatalogItemDto(): AssessmentCatalogItemDto {
        return AssessmentCatalogItemDto(
            scaleType = this.scaleType,
            title = this.title,
            subtitle = this.subtitle,
            description = this.description,
            duration = this.duration,
            questionCount = this.totalQuestions,
            sections = this.sections.map { sec ->
                AssessmentSectionDto(
                    id = sec.id,
                    title = sec.title,
                    subtitle = sec.subtitle,
                    description = sec.description,
                    questions = sec.questions.map { q ->
                        AssessmentQuestionDto(
                            id = q.id,
                            text = q.text,
                            options = q.options?.map { opt ->
                                AssessmentOptionDto(value = opt.value, label = opt.label)
                            }
                        )
                    }
                )
            }
        )
    }
}
