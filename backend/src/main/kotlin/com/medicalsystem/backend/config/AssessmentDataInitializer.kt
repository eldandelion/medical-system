package com.medicalsystem.backend.config

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.repository.AssessmentOptionGroupJpaRepository
import com.medicalsystem.backend.repository.AssessmentScaleJpaRepository
import org.slf4j.LoggerFactory
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.core.io.DefaultResourceLoader
import org.springframework.core.io.ResourceLoader
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional

@Component
class AssessmentDataInitializer(
    private val scaleJpaRepository: AssessmentScaleJpaRepository,
    private val optionGroupJpaRepository: AssessmentOptionGroupJpaRepository,
    private val resourceLoader: ResourceLoader = DefaultResourceLoader()
) {
    private val logger = LoggerFactory.getLogger(AssessmentDataInitializer::class.java)
    private val objectMapper = ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

    @EventListener(ApplicationReadyEvent::class)
    @Transactional
    fun initialize() {
        if (scaleJpaRepository.count() > 0) {
            logger.info("Assessment scales already initialized. Skipping seeding.")
            return
        }

        logger.info("Initializing assessment scale catalog from seed/assessments.json...")
        val resource = resourceLoader.getResource("classpath:seed/assessments.json")
        if (!resource.exists()) {
            logger.warn("seed/assessments.json resource not found. Skipping seeding.")
            return
        }

        val seedData: SeedDataDto = resource.inputStream.use { objectMapper.readValue(it, SeedDataDto::class.java) }

        // 1. Save option groups
        val optionGroupMap = mutableMapOf<String, AssessmentOptionGroupEntity>()
        for (groupDto in seedData.optionGroups) {
            val groupEntity = AssessmentOptionGroupEntity(name = groupDto.name)
            groupEntity.options = groupDto.options.map { opt ->
                AssessmentOptionEntity(
                    optionGroup = groupEntity,
                    value = opt.value,
                    label = opt.label
                )
            }.toMutableSet()
            val savedGroup = optionGroupJpaRepository.save(groupEntity)
            optionGroupMap[savedGroup.name] = savedGroup
        }

        // 2. Save assessment scales
        for (scaleDto in seedData.scales) {
            val scaleEntity = AssessmentScaleEntity(
                scaleType = scaleDto.scaleType,
                title = scaleDto.title,
                subtitle = scaleDto.subtitle,
                description = scaleDto.description,
                duration = scaleDto.duration,
                orderNum = scaleDto.orderNum
            )

            scaleEntity.sections = scaleDto.sections.map { secDto ->
                val sectionEntity = AssessmentSectionEntity(
                    scale = scaleEntity,
                    code = secDto.code,
                    title = secDto.title,
                    subtitle = secDto.subtitle,
                    description = secDto.description,
                    orderNum = secDto.orderNum
                )

                sectionEntity.questions = secDto.questions.map { qDto ->
                    val questionEntity = AssessmentQuestionEntity(
                        section = sectionEntity,
                        code = qDto.code,
                        text = qDto.text,
                        orderNum = qDto.orderNum,
                        optionGroup = qDto.optionGroupName?.let { optionGroupMap[it] }
                    )

                    questionEntity.customOptions = qDto.customOptions?.map { optDto ->
                        AssessmentOptionEntity(
                            question = questionEntity,
                            value = optDto.value,
                            label = optDto.label
                        )
                    }?.toMutableSet() ?: mutableSetOf()

                    questionEntity
                }.toMutableSet()

                sectionEntity
            }.toMutableSet()

            scaleEntity.scoringRules = scaleDto.scoringRules.map { ruleDto ->
                AssessmentScoringRuleEntity(
                    scale = scaleEntity,
                    ruleType = ruleDto.ruleType,
                    minScore = ruleDto.minScore,
                    maxScore = ruleDto.maxScore,
                    level = ruleDto.level,
                    isHighRisk = ruleDto.isHighRisk,
                    crisisFlag = ruleDto.crisisFlag,
                    orderNum = ruleDto.orderNum
                )
            }.toMutableSet()

            scaleJpaRepository.save(scaleEntity)
        }

        logger.info("Successfully seeded {} assessment scales into database.", seedData.scales.size)
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedDataDto {
        var optionGroups: List<SeedOptionGroupDto> = emptyList()
        var scales: List<SeedScaleDto> = emptyList()
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedOptionGroupDto {
        var name: String = ""
        var options: List<SeedOptionDto> = emptyList()
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedOptionDto {
        var value: Int = 0
        var label: String = ""
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedScaleDto {
        var scaleType: AssessmentScaleType = AssessmentScaleType.PHQ_9
        var title: String = ""
        var subtitle: String? = null
        var description: String? = null
        var duration: String = ""
        var orderNum: Int = 0
        var sections: List<SeedSectionDto> = emptyList()
        var scoringRules: List<SeedScoringRuleDto> = emptyList()
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedSectionDto {
        var code: String = ""
        var title: String = ""
        var subtitle: String? = null
        var description: String? = null
        var orderNum: Int = 0
        var questions: List<SeedQuestionDto> = emptyList()
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedQuestionDto {
        var code: String = ""
        var text: String = ""
        var orderNum: Int = 0
        var optionGroupName: String? = null
        var customOptions: List<SeedOptionDto>? = null
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    class SeedScoringRuleDto {
        var ruleType: String = ""
        var minScore: Int? = null
        var maxScore: Int? = null
        var level: String = ""
        var isHighRisk: Boolean = false
        var crisisFlag: String? = null
        var orderNum: Int = 0
    }
}
