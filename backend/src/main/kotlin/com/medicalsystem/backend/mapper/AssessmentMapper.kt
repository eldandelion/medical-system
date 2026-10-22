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
        val percentage = this.calculateProgress(scale?.totalQuestions ?: 1)

        return AssessmentListItemDto(
            id = this.id ?: 0L,
            title = scale?.title ?: this.batteryCode.value,
            subtitle = scale?.subtitle,
            batteryCode = this.batteryCode.value,
            assignedBy = AssignedByDto(
                name = finalAssignerName,
                initial = initial
            ),
            type = ASSESSMENT_TYPE,
            completionPercentage = percentage,
            duration = scale?.duration ?: "45 分钟",
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
                questionCount = sec.questions.size,
                orderNum = sec.orderNum,
                questions = sec.questions.map { q ->
                    AssessmentQuestionDto(
                        id = q.code,
                        text = q.text,
                        orderNum = q.orderNum,
                        type = q.type,
                        field = q.field,
                        placeholder = q.placeholder,
                        min = q.min,
                        max = q.max,
                        step = q.step,
                        unit = q.unit,
                        minLabel = q.minLabel,
                        maxLabel = q.maxLabel,
                        icon = q.icon,
                        zeroOptionLabel = q.zeroOptionLabel,
                        sectionCode = q.sectionCode,
                        sectionTitle = q.sectionTitle,
                        options = q.effectiveOptions.map { opt ->
                            AssessmentOptionDto(
                                value = opt.value,
                                label = opt.label,
                                hasTextInput = opt.hasTextInput,
                                textInputPlaceholder = opt.textInputPlaceholder,
                                textInputLabel = opt.textInputLabel
                            )
                        }
                    )
                }
            )
        }

        return AssessmentDetailsDto(
            id = assignment.id ?: 0L,
            title = this.title,
            subtitle = this.subtitle,
            batteryCode = assignment.batteryCode.value,
            assignedBy = AssignedByDto(
                name = finalAssignerName,
                initial = initial
            ),
            duration = this.duration,
            status = assignment.status,
            sections = sectionDtos,
            requiredQuestionIds = this.allQuestionCodes.toList(),
            savedAnswers = assignment.answers,
            questions = sectionDtos.flatMap { it.questions }
        )
    }

    fun AssessmentScale.toCatalogItemDto(): AssessmentCatalogItemDto {
        return AssessmentCatalogItemDto(
            batteryCode = this.batteryCode,
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
                    questionCount = sec.questions.size,
                    orderNum = sec.orderNum,
                    questions = sec.questions.map { q ->
                        AssessmentQuestionDto(
                            id = q.code,
                            text = q.text,
                            orderNum = q.orderNum,
                            type = q.type,
                            field = q.field,
                            placeholder = q.placeholder,
                            min = q.min,
                            max = q.max,
                            step = q.step,
                            unit = q.unit,
                            minLabel = q.minLabel,
                            maxLabel = q.maxLabel,
                            icon = q.icon,
                            zeroOptionLabel = q.zeroOptionLabel,
                            sectionCode = q.sectionCode,
                            sectionTitle = q.sectionTitle,
                            options = q.effectiveOptions.map { opt ->
                                AssessmentOptionDto(
                                    value = opt.value,
                                    label = opt.label,
                                    hasTextInput = opt.hasTextInput,
                                    textInputPlaceholder = opt.textInputPlaceholder,
                                    textInputLabel = opt.textInputLabel
                                )
                            }
                        )
                    }
                )
            }
        )
    }
}
