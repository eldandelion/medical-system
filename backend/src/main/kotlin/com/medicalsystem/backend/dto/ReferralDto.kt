package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
import com.medicalsystem.backend.model.RiskStatus
import java.time.LocalDateTime

data class ReferralDto(
    val id: String,
    val studentName: String,
    val studentNumber: String,
    val type: ReferralType,
    val date: LocalDateTime,
    val title: String,
    val description: String,
    val riskLevel: RiskStatus,
    val status: ReferralStatus,
    val referredBy: ReferredByDto,
    val availableActions: List<String> = emptyList()
)

data class ReferredByDto(
    val name: String
)
