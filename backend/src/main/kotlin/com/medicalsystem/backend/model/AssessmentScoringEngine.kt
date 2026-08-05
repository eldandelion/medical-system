package com.medicalsystem.backend.model

import com.medicalsystem.backend.exception.AssessmentValidationException

data class ScoringResult(
    val scaleType: AssessmentScaleType,
    val totalScore: Int,
    val maxScore: Int,
    val level: String,
    val isHighRisk: Boolean,
    val crisisFlags: List<String>,
    val testResultName: TestResultName
)

object AssessmentScoringEngine {

    private val DEFAULT_REQUIRED_KEYS = mapOf(
        AssessmentScaleType.PHQ_9 to (1..9).map { "phq9_$it" }.toSet(),
        AssessmentScaleType.GAD_7 to (1..7).map { "gad7_$it" }.toSet(),
        AssessmentScaleType.SCL_90 to (1..90).map { "scl90_$it" }.toSet(),
        AssessmentScaleType.PSQI to (1..7).map { "psqi_$it" }.toSet(),
        AssessmentScaleType.SLEEP_DISORDER to (1..7).map { "psqi_$it" }.toSet(),
        AssessmentScaleType.APQ_9_FATHER to (1..9).map { "apq9_father_$it" }.toSet(),
        AssessmentScaleType.APQ_9_MOTHER to (1..9).map { "apq9_mother_$it" }.toSet(),
        AssessmentScaleType.ANNUAL_COMPREHENSIVE to ((1..9).map { "phq9_$it" } + (1..7).map { "gad7_$it" } + (1..7).map { "psqi_$it" }).toSet(),
        AssessmentScaleType.COMPREHENSIVE_MENTAL to ((1..9).map { "phq9_$it" } + (1..7).map { "gad7_$it" } + (1..9).map { "apq9_father_$it" } + (1..9).map { "apq9_mother_$it" }).toSet()
    )

    fun validateAnswers(scaleType: AssessmentScaleType, answers: Map<String, Int>, scale: AssessmentScale? = null) {
        val requiredIds = scale?.allQuestionCodes ?: DEFAULT_REQUIRED_KEYS[scaleType] ?: emptySet()

        val missingKeys = requiredIds.filter { !answers.containsKey(it) }
        val invalidKeys = mutableListOf<String>()

        if (scale != null) {
            val questionMap = scale.sections.flatMap { it.questions }.associateBy { it.code }
            answers.forEach { (key, value) ->
                val q = questionMap[key]
                if (q != null) {
                    val allowedValues = q.effectiveOptions.map { it.value }
                    if (allowedValues.isNotEmpty() && value !in allowedValues) {
                        invalidKeys.add(key)
                    }
                }
            }
        } else {
            when (scaleType) {
                AssessmentScaleType.PHQ_9, AssessmentScaleType.GAD_7 -> {
                    answers.forEach { (key, value) ->
                        if (value !in 0..3) invalidKeys.add(key)
                    }
                }
                AssessmentScaleType.SCL_90 -> {
                    answers.forEach { (key, value) ->
                        if (value !in 1..5) invalidKeys.add(key)
                    }
                }
                AssessmentScaleType.PSQI, AssessmentScaleType.SLEEP_DISORDER -> {
                    answers.forEach { (key, value) ->
                        if (value !in 0..4) invalidKeys.add(key)
                    }
                }
                AssessmentScaleType.APQ_9_FATHER, AssessmentScaleType.APQ_9_MOTHER -> {
                    answers.forEach { (key, value) ->
                        if (value !in 1..5) invalidKeys.add(key)
                    }
                }
                AssessmentScaleType.ANNUAL_COMPREHENSIVE, AssessmentScaleType.COMPREHENSIVE_MENTAL -> {
                    answers.forEach { (key, value) ->
                        if (key.startsWith("phq9_") || key.startsWith("gad7_")) {
                            if (value !in 0..3) invalidKeys.add(key)
                        } else if (key.startsWith("psqi_")) {
                            if (value !in 0..4) invalidKeys.add(key)
                        } else if (key.startsWith("apq9_")) {
                            if (value !in 1..5) invalidKeys.add(key)
                        }
                    }
                }
            }
        }

        if (missingKeys.isNotEmpty() || invalidKeys.isNotEmpty()) {
            throw AssessmentValidationException(
                missingKeys = missingKeys,
                invalidKeys = invalidKeys
            )
        }
    }

    fun score(scale: AssessmentScale, answers: Map<String, Int>): ScoringResult {
        return score(scale.scaleType, answers, scale)
    }

    fun score(scaleType: AssessmentScaleType, answers: Map<String, Int>, scale: AssessmentScale? = null): ScoringResult {
        validateAnswers(scaleType, answers, scale)

        return when (scaleType) {
            AssessmentScaleType.PHQ_9 -> scorePhq9(answers)
            AssessmentScaleType.GAD_7 -> scoreGad7(answers)
            AssessmentScaleType.SCL_90 -> scoreScl90(answers)
            AssessmentScaleType.PSQI, AssessmentScaleType.SLEEP_DISORDER -> scorePsqi(answers, scaleType)
            AssessmentScaleType.ANNUAL_COMPREHENSIVE -> scoreAnnualComprehensive(answers)
            AssessmentScaleType.APQ_9_FATHER -> scoreApq(AssessmentScaleType.APQ_9_FATHER, answers, "apq9_father")
            AssessmentScaleType.APQ_9_MOTHER -> scoreApq(AssessmentScaleType.APQ_9_MOTHER, answers, "apq9_mother")
            AssessmentScaleType.COMPREHENSIVE_MENTAL -> scoreComprehensiveMental(answers)
        }
    }

    private fun scorePhq9(answers: Map<String, Int>): ScoringResult {
        val score = (1..9).sumOf { answers["phq9_$it"] ?: 0 }
        val item9 = answers["phq9_9"] ?: 0
        val level = when {
            score >= 20 -> "重度抑郁"
            score >= 15 -> "中重度抑郁"
            score >= 10 -> "中度抑郁"
            score >= 5 -> "轻度抑郁"
            else -> "正常"
        }
        val crisisFlags = mutableListOf<String>()
        if (item9 > 0) crisisFlags.add("自伤/自杀意念阳性 (PHQ-9 第9项)")
        if (score >= 15) crisisFlags.add("重度抑郁倾向")

        return ScoringResult(
            scaleType = AssessmentScaleType.PHQ_9,
            totalScore = score,
            maxScore = 27,
            level = level,
            isHighRisk = crisisFlags.isNotEmpty() || score >= 15,
            crisisFlags = crisisFlags,
            testResultName = TestResultName.PHQ_9
        )
    }

    private fun scoreGad7(answers: Map<String, Int>): ScoringResult {
        val score = (1..7).sumOf { answers["gad7_$it"] ?: 0 }
        val level = when {
            score >= 15 -> "重度焦虑"
            score >= 10 -> "中度焦虑"
            score >= 5 -> "轻度焦虑"
            else -> "正常"
        }
        val crisisFlags = mutableListOf<String>()
        if (score >= 15) crisisFlags.add("重度焦虑倾向")

        return ScoringResult(
            scaleType = AssessmentScaleType.GAD_7,
            totalScore = score,
            maxScore = 21,
            level = level,
            isHighRisk = score >= 15,
            crisisFlags = crisisFlags,
            testResultName = TestResultName.GAD_7
        )
    }

    private fun scoreScl90(answers: Map<String, Int>): ScoringResult {
        val score = (1..90).sumOf { answers["scl90_$it"] ?: 1 }
        val avgScore = score.toDouble() / 90.0
        val level = when {
            score >= 200 || avgScore >= 2.5 -> "重度症状"
            score >= 160 || avgScore >= 2.0 -> "中度症状"
            else -> "正常"
        }
        val crisisFlags = mutableListOf<String>()
        val item15 = answers["scl90_15"] ?: 1 // "想结束自己的生命"
        if (item15 >= 3) crisisFlags.add("自杀自伤意念阳性 (SCL-90 第15项)")
        if (score >= 200) crisisFlags.add("SCL-90 阳性症状严重")

        return ScoringResult(
            scaleType = AssessmentScaleType.SCL_90,
            totalScore = score,
            maxScore = 450,
            level = level,
            isHighRisk = score >= 200 || avgScore >= 2.5 || crisisFlags.isNotEmpty(),
            crisisFlags = crisisFlags,
            testResultName = TestResultName.SCL_90
        )
    }

    private fun scorePsqi(answers: Map<String, Int>, scaleType: AssessmentScaleType = AssessmentScaleType.PSQI): ScoringResult {
        val score = (1..7).sumOf { answers["psqi_$it"] ?: 0 }
        val level = when {
            score >= 15 -> "极差"
            score >= 10 -> "较差"
            score >= 5 -> "一般"
            else -> "良好"
        }
        val crisisFlags = if (score >= 15) listOf("严重睡眠障碍") else emptyList()
        val testName = if (scaleType == AssessmentScaleType.SLEEP_DISORDER) TestResultName.SLEEP_DISORDER else TestResultName.PSQI
        return ScoringResult(
            scaleType = scaleType,
            totalScore = score,
            maxScore = 28,
            level = level,
            isHighRisk = score >= 15,
            crisisFlags = crisisFlags,
            testResultName = testName
        )
    }

    private fun scoreAnnualComprehensive(answers: Map<String, Int>): ScoringResult {
        val phqRes = scorePhq9(answers)
        val gadRes = scoreGad7(answers)
        val psqiRes = scorePsqi(answers)
        val combinedScore = phqRes.totalScore + gadRes.totalScore + psqiRes.totalScore
        val isHigh = phqRes.isHighRisk || gadRes.isHighRisk || psqiRes.isHighRisk
        val level = if (isHigh) "高风险" else if (phqRes.totalScore >= 10 || gadRes.totalScore >= 10) "中风险" else "低风险"
        val flags = phqRes.crisisFlags + gadRes.crisisFlags + psqiRes.crisisFlags

        return ScoringResult(
            scaleType = AssessmentScaleType.ANNUAL_COMPREHENSIVE,
            totalScore = combinedScore,
            maxScore = 76,
            level = level,
            isHighRisk = isHigh,
            crisisFlags = flags,
            testResultName = TestResultName.ANNUAL_COMPREHENSIVE
        )
    }

    private fun scoreApq(scaleType: AssessmentScaleType, answers: Map<String, Int>, prefix: String): ScoringResult {
        val score = (1..9).sumOf { answers["${prefix}_$it"] ?: 1 }
        val testName = if (scaleType == AssessmentScaleType.APQ_9_FATHER) TestResultName.APQ_9_FATHER else TestResultName.APQ_9_MOTHER
        return ScoringResult(
            scaleType = scaleType,
            totalScore = score,
            maxScore = 45,
            level = "评估完成",
            isHighRisk = false,
            crisisFlags = emptyList(),
            testResultName = testName
        )
    }

    private fun scoreComprehensiveMental(answers: Map<String, Int>): ScoringResult {
        val phqRes = scorePhq9(answers)
        val gadRes = scoreGad7(answers)
        val fatherRes = scoreApq(AssessmentScaleType.APQ_9_FATHER, answers, "apq9_father")
        val motherRes = scoreApq(AssessmentScaleType.APQ_9_MOTHER, answers, "apq9_mother")
        val total = phqRes.totalScore + gadRes.totalScore + fatherRes.totalScore + motherRes.totalScore
        val isHigh = phqRes.isHighRisk || gadRes.isHighRisk
        val level = if (isHigh) "高风险" else if (phqRes.totalScore >= 10 || gadRes.totalScore >= 10) "中风险" else "低风险"
        val flags = phqRes.crisisFlags + gadRes.crisisFlags

        return ScoringResult(
            scaleType = AssessmentScaleType.COMPREHENSIVE_MENTAL,
            totalScore = total,
            maxScore = 138,
            level = level,
            isHighRisk = isHigh,
            crisisFlags = flags,
            testResultName = TestResultName.COMPREHENSIVE_MENTAL
        )
    }
}
