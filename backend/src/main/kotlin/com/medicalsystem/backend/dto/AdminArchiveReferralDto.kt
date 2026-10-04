package com.medicalsystem.backend.dto

import jakarta.validation.constraints.NotBlank

data class AdminArchiveReferralDto(
    @field:NotBlank(message = "强制归档原因不能为空")
    val reason: String
)
