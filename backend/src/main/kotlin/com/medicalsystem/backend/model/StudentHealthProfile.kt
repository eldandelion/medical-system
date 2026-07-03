package com.medicalsystem.backend.model

import java.time.LocalDate

data class RiskFlag(
    val id: Long?,
    val name: RiskFlagName,
    val status: FlagStatus
)

data class PsychometricTest(
    val id: Long?,
    val testResultName: TestResultName,
    val score: Int,
    val maxScore: Int,
    val level: String,
    val testDate: LocalDate
)

class StudentHealthProfile(
    val id: Long,
    val studentId: Long,
    var riskStatus: RiskStatus,
    var scidDiagnosis: String?,
    val riskFlags: MutableList<RiskFlag>,
    val psychometricTests: MutableList<PsychometricTest>
) {
    // Phase 2 Behavior: Logic moved from service into model
    fun getLatestTests(): List<PsychometricTest> {
        return psychometricTests.sortedByDescending { it.testDate }
    }
    
    fun getUniqueLatestTests(): Map<TestResultName, PsychometricTest> {
        return getLatestTests().groupBy { it.testResultName }.mapValues { it.value.first() }
    }
}
