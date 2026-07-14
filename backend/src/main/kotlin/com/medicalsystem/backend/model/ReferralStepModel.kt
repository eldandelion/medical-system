package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class ReferralStepModel(
    val id: Long,
    val type: ReferralStepType,
    val title: String,
    val subtitle: String?,
    val time: LocalDateTime,
    val status: ReferralStepStatus
)
