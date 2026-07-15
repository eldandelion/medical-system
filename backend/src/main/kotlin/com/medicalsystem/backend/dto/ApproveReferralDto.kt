package com.medicalsystem.backend.dto

import jakarta.validation.constraints.NotNull

data class ApproveReferralDto(
    @field:NotNull(message = "Hospital ID is required")
    val hospitalId: Long
)
