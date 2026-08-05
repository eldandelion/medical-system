package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.PsychometricTest
import com.medicalsystem.backend.model.RiskStatus
import org.springframework.stereotype.Service

@Service
class StudentRiskEvaluator {

    /**
     * Evaluates the current risk status of a student based on their psychometric tests.
     */
    fun evaluate(tests: List<PsychometricTest>): RiskStatus {
        if (tests.isEmpty()) {
            return RiskStatus.LOW
        }

        // TODO("Implement actual medical risk calculation logic based on latest clinical guidelines")
        return RiskStatus.LOW
    }
}
