package com.medicalsystem.backend.model

object StudentHealthProfileFactory {
    fun createInitialProfile(
        studentId: Long
    ): StudentHealthProfile {
        return StudentHealthProfile(
            id = 0,
            studentId = studentId,
            scidDiagnosis = null,
            riskStatus = RiskStatus.LOW,
            riskFlags = mutableListOf(),
            psychometricTests = mutableListOf()
        )
    }
}
