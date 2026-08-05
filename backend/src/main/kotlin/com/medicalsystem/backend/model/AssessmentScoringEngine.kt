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

    fun validateAnswers(scaleType: AssessmentScaleType, answers: Map<String, Int>, scale: AssessmentScale? = null) {
        if (scale == null) return

        val requiredIds = scale.allQuestionCodes
        val missingKeys = requiredIds.filter { !answers.containsKey(it) }
        val invalidKeys = mutableListOf<String>()

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

        val total = answers.values.sum()
        
        val testResultName = try {
            TestResultName.valueOf(scaleType.name)
        } catch (e: IllegalArgumentException) {
            TestResultName.PHQ_9
        }

        return ScoringResult(
            scaleType = scaleType,
            totalScore = total,
            maxScore = scale?.totalQuestions?.times(5) ?: 100, // Dummy max score
            level = "评估完成",
            isHighRisk = false, // Dynamic scoring deferred
            crisisFlags = emptyList(),
            testResultName = testResultName
        )
    }
}
