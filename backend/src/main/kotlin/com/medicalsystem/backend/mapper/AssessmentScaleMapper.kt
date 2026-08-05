package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import org.springframework.stereotype.Component

@Component
class AssessmentScaleMapper {

    fun toModel(entity: AssessmentScaleEntity): AssessmentScale {
        return AssessmentScale(
            id = entity.id,
            scaleType = entity.scaleType,
            title = entity.title,
            subtitle = entity.subtitle,
            description = entity.description,
            duration = entity.duration,
            orderNum = entity.orderNum,
            sections = entity.sections.sortedBy { it.orderNum }.map { toSectionModel(it) },
            scoringRules = entity.scoringRules.sortedBy { it.orderNum }.map { toScoringRuleModel(it) }
        )
    }

    fun toSectionModel(entity: AssessmentSectionEntity): AssessmentSection {
        return AssessmentSection(
            id = entity.id,
            code = entity.code,
            title = entity.title,
            subtitle = entity.subtitle,
            description = entity.description,
            orderNum = entity.orderNum,
            questions = entity.questions.sortedBy { it.orderNum }.map { toQuestionModel(it) }
        )
    }

    fun toQuestionModel(entity: AssessmentQuestionEntity): AssessmentQuestion {
        return AssessmentQuestion(
            id = entity.id,
            code = entity.code,
            text = entity.text,
            orderNum = entity.orderNum,
            optionGroup = entity.optionGroup?.let { toOptionGroupModel(it) },
            customOptions = entity.customOptions.sortedBy { it.value }.takeIf { it.isNotEmpty() }?.map { toOptionModel(it) }
        )
    }

    fun toOptionGroupModel(entity: AssessmentOptionGroupEntity): AssessmentOptionGroup {
        return AssessmentOptionGroup(
            id = entity.id,
            name = entity.name,
            options = entity.options.sortedBy { it.value }.map { toOptionModel(it) }
        )
    }

    fun toOptionModel(entity: AssessmentOptionEntity): AssessmentOption {
        return AssessmentOption(
            value = entity.value,
            label = entity.label
        )
    }

    fun toScoringRuleModel(entity: AssessmentScoringRuleEntity): AssessmentScoringRule {
        return AssessmentScoringRule(
            id = entity.id,
            ruleType = entity.ruleType,
            minScore = entity.minScore,
            maxScore = entity.maxScore,
            level = entity.level,
            isHighRisk = entity.isHighRisk,
            crisisFlag = entity.crisisFlag,
            orderNum = entity.orderNum
        )
    }

    fun toEntity(model: AssessmentScale): AssessmentScaleEntity {
        val scaleEntity = AssessmentScaleEntity(
            id = model.id,
            scaleType = model.scaleType,
            title = model.title,
            subtitle = model.subtitle,
            description = model.description,
            duration = model.duration,
            orderNum = model.orderNum
        )

        scaleEntity.sections = model.sections.map { sectionModel ->
            val sectionEntity = AssessmentSectionEntity(
                id = sectionModel.id,
                scale = scaleEntity,
                code = sectionModel.code,
                title = sectionModel.title,
                subtitle = sectionModel.subtitle,
                description = sectionModel.description,
                orderNum = sectionModel.orderNum
            )
            sectionEntity.questions = sectionModel.questions.map { questionModel ->
                val questionEntity = AssessmentQuestionEntity(
                    id = questionModel.id,
                    section = sectionEntity,
                    code = questionModel.code,
                    text = questionModel.text,
                    orderNum = questionModel.orderNum,
                    optionGroup = questionModel.optionGroup?.let { toOptionGroupEntity(it) }
                )
                questionEntity.customOptions = questionModel.customOptions?.map { optModel ->
                    AssessmentOptionEntity(
                        question = questionEntity,
                        value = optModel.value,
                        label = optModel.label
                    )
                }?.toMutableSet() ?: mutableSetOf()
                questionEntity
            }.toMutableSet()
            sectionEntity
        }.toMutableSet()

        scaleEntity.scoringRules = model.scoringRules.map { ruleModel ->
            AssessmentScoringRuleEntity(
                id = ruleModel.id,
                scale = scaleEntity,
                ruleType = ruleModel.ruleType,
                minScore = ruleModel.minScore,
                maxScore = ruleModel.maxScore,
                level = ruleModel.level,
                isHighRisk = ruleModel.isHighRisk,
                crisisFlag = ruleModel.crisisFlag,
                orderNum = ruleModel.orderNum
            )
        }.toMutableSet()

        return scaleEntity
    }

    fun toOptionGroupEntity(model: AssessmentOptionGroup): AssessmentOptionGroupEntity {
        val groupEntity = AssessmentOptionGroupEntity(
            id = model.id,
            name = model.name
        )
        groupEntity.options = model.options.map { optModel ->
            AssessmentOptionEntity(
                optionGroup = groupEntity,
                value = optModel.value,
                label = optModel.label
            )
        }.toMutableSet()
        return groupEntity
    }
}
