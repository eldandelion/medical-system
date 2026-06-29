package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class Referral(
    val id: Long?,
    val studentName: String,
    val studentNumber: String,
    val type: String,
    val date: LocalDateTime,
    val title: String,
    val description: String,
    val riskLevel: RiskStatus,
    val status: ReferralStatus,
    val referredByName: String
)
