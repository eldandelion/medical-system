package com.medicalsystem.backend.dto

import com.medicalsystem.backend.entity.RiskStatus

data class CreateReferralDto(
    val studentId: Long,
    val actionType: String, // 'draft' or 'submit'
    val title: String,
    val reason: String,
    val riskLevel: RiskStatus,
    // Ignoring complex nested structures for now like clinicalStatus and severeRiskFactors
)
