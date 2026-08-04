package com.medicalsystem.backend.model

data class CatalogOption(
    val value: Int,
    val label: String
)

data class CatalogQuestion(
    val id: String,
    val text: String,
    val options: List<CatalogOption>? = null
)

data class CatalogSection(
    val id: String,
    val title: String,
    val subtitle: String,
    val description: String,
    val questions: List<CatalogQuestion>
)

data class CatalogScaleDefinition(
    val scaleType: AssessmentScaleType,
    val title: String,
    val subtitle: String,
    val description: String,
    val duration: String,
    val sections: List<CatalogSection>
) {
    val totalQuestions: Int
        get() = sections.sumOf { it.questions.size }
    
    val allQuestionIds: Set<String>
        get() = sections.flatMap { it.questions }.map { it.id }.toSet()
}

object AssessmentScaleCatalog {

    val FOUR_POINT_FREQUENCY_OPTIONS = listOf(
        CatalogOption(0, "完全不会"),
        CatalogOption(1, "好几天"),
        CatalogOption(2, "一半以上时间"),
        CatalogOption(3, "几乎每天")
    )

    val FIVE_POINT_SEVERITY_OPTIONS = listOf(
        CatalogOption(1, "从无"),
        CatalogOption(2, "轻度"),
        CatalogOption(3, "中度"),
        CatalogOption(4, "偏重"),
        CatalogOption(5, "严重")
    )

    val SLEEP_SEVERITY_OPTIONS = listOf(
        CatalogOption(0, "无"),
        CatalogOption(1, "轻度"),
        CatalogOption(2, "中度"),
        CatalogOption(3, "重度"),
        CatalogOption(4, "极重度")
    )

    private val PHQ_9_SECTION = CatalogSection(
        id = "phq9",
        title = "情绪状况评估",
        subtitle = "PHQ-9",
        description = "在过去的两周里，您有多少时间受到以下问题的困扰？",
        questions = listOf(
            CatalogQuestion("phq9_1", "做事时提不起劲或没有兴趣", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_2", "感到心情低落，沮丧或绝望", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_3", "入睡困难、睡不安稳或睡得太多", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_4", "感觉疲倦或没有活力", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_5", "食欲不振或吃太多", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_6", "觉得自己很糟或觉得自己很失败，或让自己、家人失望", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_7", "对事物专注有困难，例如看报纸或看电视时", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_8", "动作或说话速度缓慢到别人已经察觉，或正好相反，烦躁或坐立不安、动来动去的情况比平常更多", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("phq9_9", "有不如死掉或用某种方式伤害自己的念头", FOUR_POINT_FREQUENCY_OPTIONS)
        )
    )

    private val GAD_7_SECTION = CatalogSection(
        id = "gad7",
        title = "焦虑状况评估",
        subtitle = "GAD-7",
        description = "在过去的两周里，您有多少时间受到以下问题的困扰？",
        questions = listOf(
            CatalogQuestion("gad7_1", "感觉紧张，焦虑或急切", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("gad7_2", "不能够停止或控制担忧", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("gad7_3", "对各种各样的事情担忧过多", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("gad7_4", "很难放松下来", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("gad7_5", "由于不安而无法静坐", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("gad7_6", "变得容易烦恼或急躁", FOUR_POINT_FREQUENCY_OPTIONS),
            CatalogQuestion("gad7_7", "感到似乎将有可怕的事情发生而害怕", FOUR_POINT_FREQUENCY_OPTIONS)
        )
    )

    private val PSQI_SECTION = CatalogSection(
        id = "psqi",
        title = "睡眠状况评估",
        subtitle = "PSQI",
        description = "下面是一些有关睡眠的问题。请根据最近1个月的情况填写。",
        questions = listOf(
            CatalogQuestion("psqi_1", "描述你当前(最近一个月)失眠问题的严重程度：入睡困难", SLEEP_SEVERITY_OPTIONS),
            CatalogQuestion("psqi_2", "描述你当前(最近一个月)失眠问题的严重程度：维持睡眠困难", SLEEP_SEVERITY_OPTIONS),
            CatalogQuestion("psqi_3", "描述你当前(最近一个月)失眠问题的严重程度：早醒", SLEEP_SEVERITY_OPTIONS),
            CatalogQuestion("psqi_4", "对自己当前睡眠情况的满意度", listOf(
                CatalogOption(0, "很满意"),
                CatalogOption(1, "满意"),
                CatalogOption(2, "一般"),
                CatalogOption(3, "不满意"),
                CatalogOption(4, "很不满意")
            )),
            CatalogQuestion("psqi_5", "睡眠问题在多大程度上影响了你的日间功能（如日间疲倦、情绪波动等）", SLEEP_SEVERITY_OPTIONS),
            CatalogQuestion("psqi_6", "你的睡眠问题在多大程度上引起了别人的注意或使他们担心", SLEEP_SEVERITY_OPTIONS),
            CatalogQuestion("psqi_7", "你对自己当前的睡眠问题有多担心/痛苦", SLEEP_SEVERITY_OPTIONS)
        )
    )

    private val SCL_90_QUESTIONS = (1..90).map { i ->
        val prompt = when (i) {
            1 -> "头痛"
            2 -> "神经过敏，心中不踏实"
            3 -> "头脑中有不必要的想法或字句盘旋"
            4 -> "头晕或昏倒"
            5 -> "对异性的兴趣减退"
            6 -> "对旁人责备求全"
            7 -> "感到别人能控制您的思想"
            8 -> "责怪别人制造麻烦"
            9 -> "忘性大"
            10 -> "担心自己的衣饰整齐及仪态的端正"
            15 -> "想结束自己的生命"
            else -> "症状条目第 $i 项"
        }
        CatalogQuestion("scl90_$i", prompt, FIVE_POINT_SEVERITY_OPTIONS)
    }

    private val SCL_90_SECTION = CatalogSection(
        id = "scl90",
        title = "症状自评量表",
        subtitle = "SCL-90",
        description = "请根据最近一周内身体或心理出现的实际感受进行评定。",
        questions = SCL_90_QUESTIONS
    )

    private val scales: Map<AssessmentScaleType, CatalogScaleDefinition> = mapOf(
        AssessmentScaleType.PHQ_9 to CatalogScaleDefinition(
            scaleType = AssessmentScaleType.PHQ_9,
            title = "PHQ-9 抑郁症筛查量表",
            subtitle = "Patient Health Questionnaire-9",
            description = "国际公认的抑郁症状自评筛查量表，评估最近2周内的情绪状况与自杀/自伤风险。",
            duration = "5-10 分钟",
            sections = listOf(PHQ_9_SECTION)
        ),
        AssessmentScaleType.GAD_7 to CatalogScaleDefinition(
            scaleType = AssessmentScaleType.GAD_7,
            title = "GAD-7 广泛性焦虑障碍量表",
            subtitle = "Generalized Anxiety Disorder-7",
            description = "广泛用于焦虑情绪筛查与评估，了解最近2周内紧张不安、难以控制担忧的程度。",
            duration = "5 分钟",
            sections = listOf(GAD_7_SECTION)
        ),
        AssessmentScaleType.PSQI to CatalogScaleDefinition(
            scaleType = AssessmentScaleType.PSQI,
            title = "匹兹堡睡眠质量指数",
            subtitle = "Pittsburgh Sleep Quality Index",
            description = "用于评定被试者最近1个月的睡眠质量、入睡时间、睡眠障碍等。",
            duration = "10 分钟",
            sections = listOf(PSQI_SECTION)
        ),
        AssessmentScaleType.SCL_90 to CatalogScaleDefinition(
            scaleType = AssessmentScaleType.SCL_90,
            title = "SCL-90 症状自评量表",
            subtitle = "Symptom Checklist 90",
            description = "综合性心理健康状况自评量表，覆盖躯体化、强迫、人际敏感、抑郁、焦虑等10个维度。",
            duration = "20-25 分钟",
            sections = listOf(SCL_90_SECTION)
        ),
        AssessmentScaleType.ANNUAL_COMPREHENSIVE to CatalogScaleDefinition(
            scaleType = AssessmentScaleType.ANNUAL_COMPREHENSIVE,
            title = "年度身心健康状况综合评估",
            subtitle = "2025-2026 学年学生心理健康普查",
            description = "包含情绪状态 (PHQ-9)、焦虑倾向 (GAD-7) 及睡眠质量 (PSQI) 的综合心理普查测评。",
            duration = "15-20 分钟",
            sections = listOf(PHQ_9_SECTION, GAD_7_SECTION, PSQI_SECTION)
        )
    )

    fun getScale(type: AssessmentScaleType): CatalogScaleDefinition {
        return scales[type] ?: throw IllegalArgumentException("Scale definition not found for $type")
    }

    fun getAllScales(): List<CatalogScaleDefinition> {
        return scales.values.toList()
    }
}
