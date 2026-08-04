package com.medicalsystem.backend.model

object StudentHealthProfileFactory {
    fun createInitialProfile(
        studentId: Long,
        riskLevel: RiskStatus = RiskStatus.LOW
    ): StudentHealthProfile {
        return StudentHealthProfile(
            id = 0,
            studentId = studentId,
            riskStatus = riskLevel,
            scidDiagnosis = null,
            riskFlags = mutableListOf(),
            psychometricTests = mutableListOf()
        )
    }
}
