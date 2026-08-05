package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.PsychometricTest
import com.medicalsystem.backend.model.PsychometricTestType
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.Score
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDate

class StudentRiskEvaluatorTest {

    private val evaluator = StudentRiskEvaluator()

    @Test
    fun `evaluate returns LOW when no tests are present`() {
        val result = evaluator.evaluate(emptyList())
        assertEquals(RiskStatus.LOW, result)
    }

    @Test
    fun `evaluate returns LOW as default fallback for now`() {
        val tests = listOf(
            PsychometricTest(
                testType = PsychometricTestType.PHQ_9,
                score = Score(15, 27),
                testDate = LocalDate.now()
            )
        )
        val result = evaluator.evaluate(tests)
        assertEquals(RiskStatus.LOW, result)
    }
}
