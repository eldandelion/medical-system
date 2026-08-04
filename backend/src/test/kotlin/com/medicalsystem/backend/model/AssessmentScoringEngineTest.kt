package com.medicalsystem.backend.model

import com.medicalsystem.backend.exception.AssessmentValidationException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class AssessmentScoringEngineTest {

    @Test
    fun `score PHQ-9 normal score without suicidal ideation`() {
        val answers = (1..9).associate { "phq9_$it" to 0 }
        val result = AssessmentScoringEngine.score(AssessmentScaleType.PHQ_9, answers)

        assertEquals(0, result.totalScore)
        assertEquals(27, result.maxScore)
        assertEquals("正常", result.level)
        assertFalse(result.isHighRisk)
        assertTrue(result.crisisFlags.isEmpty())
        assertEquals(TestResultName.PHQ_9, result.testResultName)
    }

    @Test
    fun `score PHQ-9 moderate depression score`() {
        val answers = mutableMapOf<String, Int>()
        (1..9).forEach { answers["phq9_$it"] = 1 } // Total: 9 -> mild (5-9)
        answers["phq9_1"] = 3 // Total: 11 -> moderate (10-14)
        answers["phq9_9"] = 0 // No suicidal ideation

        val result = AssessmentScoringEngine.score(AssessmentScaleType.PHQ_9, answers)
        assertEquals(10, result.totalScore)
        assertEquals("中度抑郁", result.level)
        assertFalse(result.isHighRisk)
        assertTrue(result.crisisFlags.isEmpty())
    }

    @Test
    fun `score PHQ-9 severe depression with suicidal ideation is high risk`() {
        val answers = (1..9).associate { "phq9_$it" to 2 }.toMutableMap()
        answers["phq9_9"] = 1 // Suicidal ideation positive

        val result = AssessmentScoringEngine.score(AssessmentScaleType.PHQ_9, answers)
        assertTrue(result.isHighRisk)
        assertTrue(result.crisisFlags.any { it.contains("自伤/自杀意念阳性") })
    }

    @Test
    fun `score PHQ-9 low total score with suicidal ideation item 9 positive flags high risk`() {
        val answers = (1..9).associate { "phq9_$it" to 0 }.toMutableMap()
        answers["phq9_9"] = 1 // Only item 9 is positive, total score = 1

        val result = AssessmentScoringEngine.score(AssessmentScaleType.PHQ_9, answers)
        assertEquals(1, result.totalScore)
        assertEquals("正常", result.level)
        assertTrue(result.isHighRisk)
        assertTrue(result.crisisFlags.any { it.contains("自伤/自杀意念阳性") })
    }

    @Test
    fun `score GAD-7 severe anxiety is high risk`() {
        val answers = (1..7).associate { "gad7_$it" to 3 } // Total: 21
        val result = AssessmentScoringEngine.score(AssessmentScaleType.GAD_7, answers)

        assertEquals(21, result.totalScore)
        assertEquals("重度焦虑", result.level)
        assertTrue(result.isHighRisk)
        assertEquals(TestResultName.GAD_7, result.testResultName)
    }

    @Test
    fun `score with missing answers throws AssessmentValidationException`() {
        val partialAnswers = mapOf("phq9_1" to 1, "phq9_2" to 2)
        val ex = assertThrows<AssessmentValidationException> {
            AssessmentScoringEngine.score(AssessmentScaleType.PHQ_9, partialAnswers)
        }
        assertTrue(ex.missingKeys.contains("phq9_9"))
    }

    @Test
    fun `score with out-of-range value throws AssessmentValidationException`() {
        val answers = (1..9).associate { "phq9_$it" to 0 }.toMutableMap()
        answers["phq9_1"] = 5 // Out of range for PHQ-9 (0-3)

        val ex = assertThrows<AssessmentValidationException> {
            AssessmentScoringEngine.score(AssessmentScaleType.PHQ_9, answers)
        }
        assertTrue(ex.invalidKeys.contains("phq9_1"))
    }
}
