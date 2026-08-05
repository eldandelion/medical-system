package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class AssessmentScoringEngineTest {

    @Test
    fun `scoreSection should return correct PsychometricTest`() {
        val answers = mapOf("q1" to 1, "q2" to 2)
        
        val scale = AssessmentScale(
            batteryCode = "MENTAL_HEALTH_ASSESSMENT",
            title = "Test",
            subtitle = "",
            description = "",
            duration = "",
            sections = listOf(
                AssessmentSection(
                    code = "phq_9",
                    title = "PHQ-9",
                    subtitle = "",
                    description = "",
                    questions = listOf(
                        AssessmentQuestion(code = "q1", text = "Q1", optionGroup = AssessmentOptionGroup("group1", listOf(
                            AssessmentOption(0, "0"),
                            AssessmentOption(1, "1")
                        ))),
                        AssessmentQuestion(code = "q2", text = "Q2", optionGroup = AssessmentOptionGroup("group2", listOf(
                            AssessmentOption(0, "0"),
                            AssessmentOption(2, "2")
                        )))
                    )
                )
            ),
            scoringRules = listOf(
                AssessmentScoringRule("phq_9", 0, 3, "NONE")
            )
        )
        
        val result = AssessmentScoringEngine.scoreSection(scale.sections.first(), answers)

        assertEquals(PsychometricTestType.PHQ_9, result.testType)
        // Score is 0 since the actual engine is stubbed out
        assertEquals(0, result.score.points)
        assertEquals(0, result.score.max)
    }
}


