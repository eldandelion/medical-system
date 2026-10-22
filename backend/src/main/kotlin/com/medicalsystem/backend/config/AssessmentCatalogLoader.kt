package com.medicalsystem.backend.config

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.medicalsystem.backend.exception.AssessmentCatalogInitializationException
import com.medicalsystem.backend.model.*
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.core.io.ResourceLoader
import org.springframework.core.io.support.PathMatchingResourcePatternResolver
import org.springframework.stereotype.Component
import java.util.Collections

@Component
class AssessmentCatalogLoader(
    private val resourceLoader: ResourceLoader? = null
) {
    private val objectMapper: ObjectMapper = jacksonObjectMapper()
    private val logger = LoggerFactory.getLogger(AssessmentCatalogLoader::class.java)

    private val optionGroups = mutableMapOf<String, List<AssessmentOption>>()
    private val scaleDetailsMap = LinkedHashMap<String, AssessmentScale>()
    private val standaloneSurveysMap = LinkedHashMap<String, AssessmentScale>()
    private val questionToScaleMap = HashMap<String, String>()

    @PostConstruct
    fun init() {
        loadCatalog()
    }

    @Synchronized
    fun loadCatalog(): Map<String, AssessmentScale> {
        try {
            optionGroups.clear()
            scaleDetailsMap.clear()
            standaloneSurveysMap.clear()
            questionToScaleMap.clear()

            val resolver = PathMatchingResourcePatternResolver(resourceLoader?.classLoader ?: Thread.currentThread().contextClassLoader)

            // 1. Load shared option groups
            val sharedResource = resolver.getResource("classpath:assessments/shared_option_groups.json")
            if (!sharedResource.exists()) {
                throw AssessmentCatalogInitializationException("shared_option_groups.json not found in classpath")
            }
            sharedResource.inputStream.use { input ->
                val root: JsonNode = objectMapper.readTree(input)
                for (groupNode in root) {
                    val name = groupNode.get("name")?.asText() ?: continue
                    val optionsList = mutableListOf<AssessmentOption>()
                    val optionsArray = groupNode.get("options")
                    if (optionsArray != null && optionsArray.isArray) {
                        for (opt in optionsArray) {
                            val valueNode = opt.get("value")
                            val valObj: Any = if (valueNode.isInt) valueNode.asInt() else valueNode.asText()
                            val label = opt.get("label")?.asText() ?: ""
                            val hasTextInput = opt.get("hasTextInput")?.asBoolean() ?: false
                            val textInputPlaceholder = opt.get("textInputPlaceholder")?.asText()
                            val textInputLabel = opt.get("textInputLabel")?.asText()
                            optionsList.add(
                                AssessmentOption(
                                    value = valObj,
                                    label = label,
                                    hasTextInput = hasTextInput,
                                    textInputPlaceholder = textInputPlaceholder,
                                    textInputLabel = textInputLabel
                                )
                            )
                        }
                    }
                    optionGroups[name] = Collections.unmodifiableList(optionsList)
                }
            }

            // 2. Load standalone surveys (like demographics_survey.json and general_health_screener.json)
            loadStandaloneSurvey(resolver, "demographics_survey.json")
            loadStandaloneSurvey(resolver, "general_health_screener.json")

            // 3. Load assessment batteries (assessment_groups.json)
            val groupsResource = resolver.getResource("classpath:assessments/assessment_groups.json")
            if (!groupsResource.exists()) {
                throw AssessmentCatalogInitializationException("assessment_groups.json not found in classpath")
            }

            groupsResource.inputStream.use { input ->
                val root: JsonNode = objectMapper.readTree(input)
                val fieldNames = root.fieldNames()
                var scaleOrder = 1
                while (fieldNames.hasNext()) {
                    val batteryCode = fieldNames.next()
                    val groupNode = root.get(batteryCode)

                    val title = groupNode.get("title")?.asText() ?: batteryCode
                    val subtitle = groupNode.get("subtitle")?.asText()
                    val description = groupNode.get("description")?.asText() ?: ""
                    val durationStr = groupNode.get("duration")?.asText() ?: "45 分钟"
                    val estimatedMinutes = Regex("""\d+""").find(durationStr)?.value?.toIntOrNull() ?: 45
                    val instructions = groupNode.get("instructions")?.asText() ?: description

                    val introItemsList = mutableListOf<ScaleIntroItem>()
                    if (groupNode.has("introItems") && groupNode.get("introItems").isArray) {
                        for (itemNode in groupNode.get("introItems")) {
                            val icon = itemNode.get("icon")?.asText() ?: "assignment"
                            val itemTitle = itemNode.get("title")?.asText() ?: ""
                            val itemDesc = itemNode.get("description")?.asText() ?: ""
                            if (itemTitle.isNotBlank()) {
                                introItemsList.add(ScaleIntroItem(icon, itemTitle, itemDesc))
                            }
                        }
                    }

                    val questionnairesNode = groupNode.get("questionnaires")
                        ?: throw AssessmentCatalogInitializationException("Battery '$batteryCode' missing questionnaires list")

                    val batterySections = mutableListOf<AssessmentSection>()
                    val seenQuestionIds = mutableSetOf<String>()
                    var globalOrder = 1

                    for (qCodeNode in questionnairesNode) {
                        val qCode = qCodeNode.asText()
                        val qResource = resolver.getResource("classpath:assessments/$qCode.json")
                        if (!qResource.exists()) {
                            throw AssessmentCatalogInitializationException(
                                "Referenced questionnaire '$qCode' in battery '$batteryCode' not found in classpath"
                            )
                        }

                        qResource.inputStream.use { qInput ->
                            val qRoot: JsonNode = objectMapper.readTree(qInput)
                            val subscaleTitle = qRoot.get("title")?.asText() ?: qCode

                            if (qRoot.has("sections") && qRoot.get("sections").isArray) {
                                for (secNode in qRoot.get("sections")) {
                                    val secId = secNode.get("id")?.asText() ?: qCode
                                    val secTitle = secNode.get("title")?.asText() ?: subscaleTitle
                                    val qNodes = secNode.get("questions")
                                    val secQuestions = mutableListOf<AssessmentQuestion>()
                                    if (qNodes != null && qNodes.isArray) {
                                        for (qNode in qNodes) {
                                            val q = parseQuestionNode(qNode, globalOrder++, secId, secTitle, qCode, seenQuestionIds, batteryCode)
                                            secQuestions.add(q)
                                            questionToScaleMap[q.code] = qCode
                                        }
                                    }
                                    batterySections.add(
                                        AssessmentSection(
                                            code = secId,
                                            title = secTitle,
                                            subtitle = secNode.get("subtitle")?.asText(),
                                            description = secNode.get("description")?.asText(),
                                            orderNum = batterySections.size + 1,
                                            questionCount = secQuestions.size,
                                            questions = Collections.unmodifiableList(secQuestions)
                                        )
                                    )
                                }
                            } else {
                                val questionsNode = qRoot.get("questions")
                                    ?: throw AssessmentCatalogInitializationException("No questions found in questionnaire '$qCode'")

                                val secQuestions = mutableListOf<AssessmentQuestion>()
                                for (qNode in questionsNode) {
                                    val q = parseQuestionNode(qNode, globalOrder++, qCode, subscaleTitle, qCode, seenQuestionIds, batteryCode)
                                    secQuestions.add(q)
                                    questionToScaleMap[q.code] = qCode
                                }

                                batterySections.add(
                                    AssessmentSection(
                                        code = qCode,
                                        title = subscaleTitle,
                                        subtitle = qRoot.get("subtitle")?.asText(),
                                        description = qRoot.get("description")?.asText(),
                                        orderNum = batterySections.size + 1,
                                        questionCount = secQuestions.size,
                                        questions = Collections.unmodifiableList(secQuestions)
                                    )
                                )
                            }
                        }
                    }

                    val scale = AssessmentScale(
                        batteryCode = batteryCode,
                        title = title,
                        subtitle = subtitle,
                        description = description,
                        duration = durationStr,
                        estimatedMinutes = estimatedMinutes,
                        instructions = instructions,
                        introItems = Collections.unmodifiableList(introItemsList),
                        orderNum = scaleOrder++,
                        sections = Collections.unmodifiableList(batterySections)
                    )
                    scaleDetailsMap[batteryCode] = scale
                }
            }

            logger.info("Successfully loaded ${scaleDetailsMap.size} assessment scales (total questions in primary: ${scaleDetailsMap.values.firstOrNull()?.totalQuestions ?: 0})")
            return Collections.unmodifiableMap(scaleDetailsMap)
        } catch (e: Exception) {
            if (e is AssessmentCatalogInitializationException) throw e
            throw AssessmentCatalogInitializationException("Failed to load assessment catalog: ${e.message}", e)
        }
    }

    private fun loadStandaloneSurvey(resolver: PathMatchingResourcePatternResolver, fileName: String) {
        val resource = resolver.getResource("classpath:assessments/$fileName")
        if (!resource.exists()) {
            return
        }
        try {
            resource.inputStream.use { input ->
                val root: JsonNode = objectMapper.readTree(input)
                val code = root.get("id")?.asText() ?: root.get("code")?.asText() ?: fileName.removeSuffix(".json")
                val title = root.get("title")?.asText() ?: code
                val subtitle = root.get("subtitle")?.asText()
                val description = root.get("description")?.asText() ?: ""
                val durationStr = root.get("duration")?.asText() ?: "10 分钟"
                val estimatedMinutes = root.get("estimatedMinutes")?.asInt() ?: 10
                val instructions = root.get("instructions")?.asText() ?: description

                val introItemsList = mutableListOf<ScaleIntroItem>()
                if (root.has("introItems") && root.get("introItems").isArray) {
                    for (itemNode in root.get("introItems")) {
                        val icon = itemNode.get("icon")?.asText() ?: "assignment"
                        val itemTitle = itemNode.get("title")?.asText() ?: ""
                        val itemDesc = itemNode.get("description")?.asText() ?: ""
                        if (itemTitle.isNotBlank()) {
                            introItemsList.add(ScaleIntroItem(icon, itemTitle, itemDesc))
                        }
                    }
                }

                val sectionsList = mutableListOf<AssessmentSection>()
                var globalOrder = 1
                val seenIds = mutableSetOf<String>()

                if (root.has("sections") && root.get("sections").isArray) {
                    for (secNode in root.get("sections")) {
                        val secId = secNode.get("id")?.asText() ?: "section_${sectionsList.size + 1}"
                        val secTitle = secNode.get("title")?.asText() ?: secId
                        val qNodes = secNode.get("questions")
                        val secQuestions = mutableListOf<AssessmentQuestion>()
                        if (qNodes != null && qNodes.isArray) {
                            for (qNode in qNodes) {
                                val q = parseQuestionNode(qNode, globalOrder++, secId, secTitle, code, seenIds, code)
                                secQuestions.add(q)
                            }
                        }
                        sectionsList.add(
                            AssessmentSection(
                                code = secId,
                                title = secTitle,
                                subtitle = secNode.get("subtitle")?.asText(),
                                description = secNode.get("description")?.asText(),
                                orderNum = sectionsList.size + 1,
                                questionCount = secQuestions.size,
                                questions = Collections.unmodifiableList(secQuestions)
                            )
                        )
                    }
                }

                standaloneSurveysMap[code] = AssessmentScale(
                    batteryCode = code,
                    title = title,
                    subtitle = subtitle,
                    description = description,
                    duration = durationStr,
                    estimatedMinutes = estimatedMinutes,
                    instructions = instructions,
                    introItems = Collections.unmodifiableList(introItemsList),
                    orderNum = standaloneSurveysMap.size + 1,
                    sections = Collections.unmodifiableList(sectionsList)
                )
            }
        } catch (e: Exception) {
            logger.warn("Could not load standalone survey $fileName: ${e.message}")
        }
    }

    private fun parseQuestionNode(
        qNode: JsonNode,
        orderNum: Int,
        sectionCode: String,
        sectionTitle: String,
        scaleCode: String,
        seenQuestionIds: MutableSet<String>,
        batteryCode: String
    ): AssessmentQuestion {
        val qId = qNode.get("id")?.asText() ?: qNode.get("code")?.asText()
            ?: throw AssessmentCatalogInitializationException("Question missing id/code in '$scaleCode'")

        if (!seenQuestionIds.add(qId)) {
            throw AssessmentCatalogInitializationException(
                "Duplicate question ID '$qId' detected in battery '$batteryCode'"
            )
        }

        val text = qNode.get("text")?.asText() ?: ""
        val type = qNode.get("type")?.asText() ?: "single_choice"
        val placeholder = qNode.get("placeholder")?.asText()
        val min = if (qNode.has("min") && !qNode.get("min").isNull) qNode.get("min").asDouble() else null
        val max = if (qNode.has("max") && !qNode.get("max").isNull) qNode.get("max").asDouble() else null
        val step = if (qNode.has("step") && !qNode.get("step").isNull) qNode.get("step").asDouble() else null
        val unit = qNode.get("unit")?.asText()
        val minLabel = qNode.get("minLabel")?.asText()
        val maxLabel = qNode.get("maxLabel")?.asText()
        val icon = qNode.get("icon")?.asText()
        val zeroOptionLabel = qNode.get("zeroOptionLabel")?.asText()
        val field = qNode.get("field")?.asText()?.trim()?.ifEmpty { null }

        var optionGroup: AssessmentOptionGroup? = null
        var customOptions: List<AssessmentOption>? = null

        if (qNode.has("optionGroupName")) {
            val groupName = qNode.get("optionGroupName").asText()
            val opts = optionGroups[groupName]
                ?: throw AssessmentCatalogInitializationException(
                    "Unknown option group '$groupName' for question '$qId' in scale '$scaleCode'"
                )
            optionGroup = AssessmentOptionGroup(name = groupName, options = opts)
        } else if (qNode.has("customOptions") && qNode.get("customOptions").isArray) {
            customOptions = parseOptionArray(qNode.get("customOptions"))
        } else if (qNode.has("options") && qNode.get("options").isArray) {
            customOptions = parseOptionArray(qNode.get("options"))
        }

        return AssessmentQuestion(
            code = qId,
            text = text,
            orderNum = orderNum,
            type = type,
            field = field,
            placeholder = placeholder,
            min = min,
            max = max,
            step = step,
            unit = unit,
            minLabel = minLabel,
            maxLabel = maxLabel,
            icon = icon,
            zeroOptionLabel = zeroOptionLabel,
            optionGroup = optionGroup,
            customOptions = customOptions,
            sectionCode = sectionCode,
            sectionTitle = sectionTitle
        )
    }

    private fun parseOptionArray(arrayNode: JsonNode): List<AssessmentOption> {
        val list = mutableListOf<AssessmentOption>()
        for (opt in arrayNode) {
            val valueNode = opt.get("value")
            val valObj: Any = if (valueNode.isInt) valueNode.asInt() else valueNode.asText()
            val label = opt.get("label")?.asText() ?: ""
            val hasTextInput = opt.get("hasTextInput")?.asBoolean() ?: false
            val textInputPlaceholder = opt.get("textInputPlaceholder")?.asText()
            val textInputLabel = opt.get("textInputLabel")?.asText()
            list.add(
                AssessmentOption(
                    value = valObj,
                    label = label,
                    hasTextInput = hasTextInput,
                    textInputPlaceholder = textInputPlaceholder,
                    textInputLabel = textInputLabel
                )
            )
        }
        return list
    }

    fun getScaleDetail(code: String): AssessmentScale? =
        scaleDetailsMap[code]
            ?: scaleDetailsMap.entries.find { it.key.equals(code, ignoreCase = true) }?.value
            ?: standaloneSurveysMap[code]
            ?: standaloneSurveysMap.entries.find { it.key.equals(code, ignoreCase = true) }?.value

    fun getScaleDetails(): List<AssessmentScale> = scaleDetailsMap.values.toList()

    fun getScaleCodes(): List<String> = scaleDetailsMap.keys.toList()

    fun lookupScaleCodeForQuestion(questionId: String): String? = questionToScaleMap[questionId]
}
