package com.medicalsystem.backend.model

object StudentHealthProfileFactory {
    fun createInitialProfile(
        studentId: Long,
        riskLevelStr: String?
    ): StudentHealthProfile {
        val riskLevel = try {
            if (riskLevelStr != null) RiskStatus.valueOf(riskLevelStr.uppercase()) else RiskStatus.LOW
        } catch (e: IllegalArgumentException) {
            RiskStatus.LOW
        }
        
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
