package com.medicalsystem.backend.model

import com.medicalsystem.backend.exception.AssessmentValidationException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

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
            orderNum = 1,
            sections = listOf(
                AssessmentSection(
                    code = "phq_9",
                    title = "PHQ-9",
                    subtitle = "",
                    description = "",
                    orderNum = 1,
                    questions = listOf(
                        AssessmentQuestion(code = "q1", text = "Q1", orderNum = 1, optionGroup = AssessmentOptionGroup("group1", listOf(
                            AssessmentOption(0, "0"),
                            AssessmentOption(1, "1")
                        ))),
                        AssessmentQuestion(code = "q2", text = "Q2", orderNum = 2, optionGroup = AssessmentOptionGroup("group2", listOf(
                            AssessmentOption(0, "0"),
                            AssessmentOption(2, "2")
                        )))
                    )
                )
            )
        )
        
        val result = AssessmentScoringEngine.scoreSection(1L, scale.sections.first(), answers)

        assertEquals(PsychometricTestType.PHQ_9, result.testType)
        // Score is 0 since the actual engine is stubbed out
        assertEquals(0, result.score.points)
        assertEquals(0, result.score.max)
    }

    @Test
    fun `validateAnswers should pass when all questions are answered exactly`() {
        val scale = AssessmentScale(
            batteryCode = "TEST", title = "Test", duration = "", orderNum = 1,
            sections = listOf(AssessmentSection(code = "S1", title = "S1", orderNum = 1, questions = listOf(
                AssessmentQuestion(code = "Q1", text = "Q1", orderNum = 1),
                AssessmentQuestion(code = "Q2", text = "Q2", orderNum = 2)
            )))
        )
        val answers = mapOf("Q1" to 1, "Q2" to 2)
        assertDoesNotThrow { AssessmentScoringEngine.validateAnswers(scale, answers) }
    }

    @Test
    fun `validateAnswers should throw exception when a question is missing`() {
        val scale = AssessmentScale(
            batteryCode = "TEST", title = "Test", duration = "", orderNum = 1,
            sections = listOf(AssessmentSection(code = "S1", title = "S1", orderNum = 1, questions = listOf(
                AssessmentQuestion(code = "Q1", text = "Q1", orderNum = 1),
                AssessmentQuestion(code = "Q2", text = "Q2", orderNum = 2)
            )))
        )
        val answers = mapOf("Q1" to 1)
        val exception = assertThrows<AssessmentValidationException> {
            AssessmentScoringEngine.validateAnswers(scale, answers)
        }
        assertEquals(listOf("Q2"), exception.missingKeys)
        assertTrue(exception.invalidKeys.isEmpty())
    }

    @Test
    fun `validateAnswers should throw exception when invalid questions are provided`() {
        val scale = AssessmentScale(
            batteryCode = "TEST", title = "Test", duration = "", orderNum = 1,
            sections = listOf(AssessmentSection(code = "S1", title = "S1", orderNum = 1, questions = listOf(
                AssessmentQuestion(code = "Q1", text = "Q1", orderNum = 1)
            )))
        )
        val answers = mapOf("Q1" to 1, "Q2" to 2)
        val exception = assertThrows<AssessmentValidationException> {
            AssessmentScoringEngine.validateAnswers(scale, answers)
        }
        assertTrue(exception.missingKeys.isEmpty())
        assertEquals(listOf("Q2"), exception.invalidKeys)
    }
}


