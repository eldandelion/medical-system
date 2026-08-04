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

    fun validateAnswers(scaleType: AssessmentScaleType, answers: Map<String, Int>) {
        val scale = AssessmentScaleCatalog.getScale(scaleType)
        val requiredIds = scale.allQuestionIds

        val missingKeys = requiredIds.filter { !answers.containsKey(it) }
        val invalidKeys = mutableListOf<String>()

        // Validate values
        when (scaleType) {
            AssessmentScaleType.PHQ_9, AssessmentScaleType.GAD_7 -> {
                answers.forEach { (key, value) ->
                    if (value !in 0..3) {
                        invalidKeys.add(key)
                    }
                }
            }
            AssessmentScaleType.SCL_90 -> {
                answers.forEach { (key, value) ->
                    if (value !in 1..5) {
                        invalidKeys.add(key)
                    }
                }
            }
            AssessmentScaleType.PSQI -> {
                answers.forEach { (key, value) ->
                    if (value !in 0..4) {
                        invalidKeys.add(key)
                    }
                }
            }
            AssessmentScaleType.ANNUAL_COMPREHENSIVE -> {
                answers.forEach { (key, value) ->
                    if (key.startsWith("phq9_") || key.startsWith("gad7_")) {
                        if (value !in 0..3) invalidKeys.add(key)
                    } else if (key.startsWith("psqi_")) {
                        if (value !in 0..4) invalidKeys.add(key)
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

    fun score(scaleType: AssessmentScaleType, answers: Map<String, Int>): ScoringResult {
        validateAnswers(scaleType, answers)

        return when (scaleType) {
            AssessmentScaleType.PHQ_9 -> scorePhq9(answers)
            AssessmentScaleType.GAD_7 -> scoreGad7(answers)
            AssessmentScaleType.SCL_90 -> scoreScl90(answers)
            AssessmentScaleType.PSQI -> scorePsqi(answers)
            AssessmentScaleType.ANNUAL_COMPREHENSIVE -> scoreAnnualComprehensive(answers)
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

    private fun scorePsqi(answers: Map<String, Int>): ScoringResult {
        val score = (1..7).sumOf { answers["psqi_$it"] ?: 0 }
        val level = when {
            score >= 15 -> "极差"
            score >= 10 -> "较差"
            score >= 5 -> "一般"
            else -> "良好"
        }
        val crisisFlags = if (score >= 15) listOf("严重睡眠障碍") else emptyList()
        return ScoringResult(
            scaleType = AssessmentScaleType.PSQI,
            totalScore = score,
            maxScore = 28,
            level = level,
            isHighRisk = score >= 15,
            crisisFlags = crisisFlags,
            testResultName = TestResultName.PSQI
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
}
