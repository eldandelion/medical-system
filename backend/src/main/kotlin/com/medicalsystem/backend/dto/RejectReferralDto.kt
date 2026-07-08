package com.medicalsystem.backend.dto

import jakarta.validation.constraints.NotBlank

data class RejectReferralDto(
    @field:NotBlank(message = "拒绝原因不能为空")
    val reason: String
)
