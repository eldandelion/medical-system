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

    fun recordAssessmentResult(scoringResult: ScoringResult, testDate: LocalDate = LocalDate.now()): PsychometricTest {
        val test = PsychometricTest(
            id = null,
            testResultName = scoringResult.testResultName,
            score = scoringResult.totalScore,
            maxScore = scoringResult.maxScore,
            level = scoringResult.level,
            testDate = testDate
        )
        psychometricTests.add(test)

        if (scoringResult.isHighRisk) {
            this.riskStatus = RiskStatus.HIGH
            if (scoringResult.crisisFlags.any { it.contains("自杀") || it.contains("自伤") }) {
                val hasActiveSuicideFlag = riskFlags.any {
                    it.name == RiskFlagName.SUICIDAL_IDEATION && it.status == FlagStatus.POSITIVE
                }
                if (!hasActiveSuicideFlag) {
                    riskFlags.add(
                        RiskFlag(
                            id = null,
                            name = RiskFlagName.SUICIDAL_IDEATION,
                            status = FlagStatus.POSITIVE
                        )
                    )
                }
            }
        } else if (this.riskStatus == RiskStatus.LOW && (scoringResult.totalScore >= scoringResult.maxScore * 0.35)) {
            this.riskStatus = RiskStatus.MEDIUM
        }
        return test
    }
}

