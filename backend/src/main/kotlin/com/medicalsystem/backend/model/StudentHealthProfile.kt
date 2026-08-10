package com.medicalsystem.backend.model

import java.time.LocalDate
import com.medicalsystem.backend.service.StudentRiskEvaluator

data class RiskFlag(
    val id: Long?,
    val name: RiskFlagName,
    val status: FlagStatus
)

class StudentHealthProfile(
    val id: Long,
    val studentId: Long,
    var scidDiagnosis: String?,
    var riskStatus: RiskStatus,
    val riskFlags: MutableList<RiskFlag>,
    val psychometricTests: MutableList<PsychometricTest>
) {
    // Phase 2 Behavior: Logic moved from service into model
    fun getLatestTests(): List<PsychometricTest> {
        return psychometricTests.sortedByDescending { it.testDate }
    }
    
    fun getUniqueLatestTests(): Map<PsychometricTestType, PsychometricTest> {
        return getLatestTests().groupBy { it.testType }.mapValues { it.value.first() }
    }

    fun recordAssessmentResult(test: PsychometricTest): PsychometricTest {
        psychometricTests.add(test)
        
        // TODO: Implement holistic risk calculation based on all historical tests
        // val evaluator = HolisticRiskEvaluator(...)
        // this.riskStatus = evaluator.evaluate(this.psychometricTests)
        
        return test
    }
    
    fun evaluateRisk(evaluator: StudentRiskEvaluator): RiskStatus {
        return evaluator.evaluate(this.psychometricTests)
    }
}
