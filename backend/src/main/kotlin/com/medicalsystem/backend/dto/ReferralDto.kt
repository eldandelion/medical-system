package com.medicalsystem.backend.dto

import com.medicalsystem.backend.entity.ReferralStatus
import com.medicalsystem.backend.entity.RiskStatus
import java.time.LocalDateTime

data class ReferralDto(
    val id: String,
    val studentName: String,
    val studentNumber: String,
    val type: String,
    val date: LocalDateTime,
    val title: String,
    val description: String,
    val riskLevel: RiskStatus,
    val status: ReferralStatus,
    val referredBy: ReferredByDto
)

data class ReferredByDto(
    val name: String
)
