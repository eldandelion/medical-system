package com.medicalsystem.backend.config

import com.fasterxml.jackson.annotation.JsonIgnoreProperties
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.medicalsystem.backend.exception.AssessmentCatalogInitializationException
import com.medicalsystem.backend.model.*
import org.slf4j.LoggerFactory
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.stereotype.Component

@Component
class AssessmentCatalogLoader {
    private val objectMapper = jacksonObjectMapper()
    private val logger = LoggerFactory.getLogger(AssessmentCatalogLoader::class.java)

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class GroupDto(
        val title: String,
        val subtitle: String? = null,
        val description: String? = null,
        val duration: String,
        val questionnaires: List<String> = emptyList()
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class SectionDto(
        val code: String,
        val title: String,
        val subtitle: String? = null,
        val description: String? = null,
        val questions: List<QuestionDto> = emptyList()
    )

    @JsonIgnoreProperties(ignoreUnknown = true)
    data class QuestionDto(
        val code: String,
        val text: String,
        val orderNum: Int = 0,
        val optionGroupName: String? = null,
        val customOptions: List<AssessmentOption>? = null
    )

    fun loadCatalog(): Map<AssessmentScaleType, AssessmentScale> {
        try {
            val resolver = PathMatchingResourcePatternResolver()
            
            // 1. Load shared option groups
            val optionGroupsResource = resolver.getResource("classpath:assessments/shared_option_groups.json")
            if (!optionGroupsResource.exists()) {
                throw AssessmentCatalogInitializationException("shared_option_groups.json not found")
            }
            val optionGroupsList = optionGroupsResource.inputStream.use { 
                objectMapper.readValue(it, Array<AssessmentOptionGroup>::class.java)
            }.toList()
            val optionGroupsMap = optionGroupsList.associateBy { it.name }

            // 2. Load all questionnaires (sections)
            val resources = resolver.getResources("classpath:assessments/*.json")
            val sectionDtos = mutableMapOf<String, SectionDto>()
            for (resource in resources) {
                val filename = resource.filename ?: continue
                if (filename == "assessment_groups.json" || filename == "shared_option_groups.json") continue
                
                val sectionDto = resource.inputStream.use { 
                    objectMapper.readValue(it, SectionDto::class.java)
                }
                sectionDtos[sectionDto.code] = sectionDto
            }

            // 3. Load groups
            val groupsResource = resolver.getResource("classpath:assessments/assessment_groups.json")
            if (!groupsResource.exists()) {
                throw AssessmentCatalogInitializationException("assessment_groups.json not found")
            }
            val groupsMap = groupsResource.inputStream.use {
                val typeRef = objectMapper.typeFactory.constructMapType(Map::class.java, String::class.java, GroupDto::class.java)
                objectMapper.readValue(it, typeRef) as Map<String, GroupDto>
            }

            // 4. Assemble AssessmentScales
            val catalog = mutableMapOf<AssessmentScaleType, AssessmentScale>()
            
            for ((key, groupDto) in groupsMap) {
                val scaleType = try {
                    AssessmentScaleType.valueOf(key)
                } catch (e: IllegalArgumentException) {
                    throw AssessmentCatalogInitializationException("Unknown AssessmentScaleType: $key")
                }
                
                val sections = groupDto.questionnaires.mapIndexed { index, code ->
                    val sectionDto = sectionDtos[code] ?: throw AssessmentCatalogInitializationException("Missing questionnaire definition for code: $code in group $key")
                    
                    val questions = sectionDto.questions.map { qDto ->
                        val optionGroup = qDto.optionGroupName?.let { 
                            optionGroupsMap[it] ?: throw AssessmentCatalogInitializationException("Unknown option group: $it in question ${qDto.code}")
                        }
                        
                        AssessmentQuestion(
                            code = qDto.code,
                            text = qDto.text,
                            orderNum = qDto.orderNum,
                            optionGroup = optionGroup,
                            customOptions = qDto.customOptions
                        )
                    }
                    
                    AssessmentSection(
                        code = sectionDto.code,
                        title = sectionDto.title,
                        subtitle = sectionDto.subtitle,
                        description = sectionDto.description,
                        orderNum = index + 1,
                        questions = questions
                    )
                }
                
                val scale = AssessmentScale(
                    scaleType = scaleType,
                    title = groupDto.title,
                    subtitle = groupDto.subtitle,
                    description = groupDto.description,
                    duration = groupDto.duration,
                    orderNum = 0,
                    sections = sections,
                    scoringRules = emptyList()
                )
                
                catalog[scaleType] = scale
            }
            
            logger.info("Successfully loaded ${catalog.size} assessment scales from JSON files.")
            return java.util.Collections.unmodifiableMap(catalog)
        } catch (e: Exception) {
            if (e is AssessmentCatalogInitializationException) throw e
            throw AssessmentCatalogInitializationException("Failed to load assessment catalog from JSON files", e)
        }
    }
}
