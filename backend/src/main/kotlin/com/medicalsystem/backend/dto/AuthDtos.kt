package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.UserRole
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.Size

data class VerifyIdentifierRequest(
    @field:NotBlank(message = "IDENTIFIER_REQUIRED")
    @field:Size(max = 100, message = "IDENTIFIER_TOO_LONG")
    val identifier: String
)

data class VerifyIdentifierResponse(
    val exists: Boolean,
    val isAccountActive: Boolean = true,
    val maskedIdentifier: String? = null,
    val role: UserRole? = null
)
