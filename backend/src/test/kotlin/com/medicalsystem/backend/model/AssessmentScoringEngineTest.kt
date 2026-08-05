package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class AssessmentScoringEngineTest {

    @Test
    fun `score should return general assessment result`() {
        val answers = mapOf("q1" to 1, "q2" to 2)
        val result = AssessmentScoringEngine.score(AssessmentScaleType.MENTAL_HEALTH_ASSESSMENT, answers)

        assertEquals(AssessmentScaleType.MENTAL_HEALTH_ASSESSMENT, result.scaleType)
        assertEquals(3, result.totalScore)
        assertEquals("评估完成", result.level)
        assertFalse(result.isHighRisk)
        assertTrue(result.crisisFlags.isEmpty())
        assertEquals(TestResultName.MENTAL_HEALTH_ASSESSMENT, result.testResultName)
    }
}
