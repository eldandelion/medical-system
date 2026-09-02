package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.UserRole
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Size

data class VerifyIdentifierRequest(
    @field:NotBlank(message = "IDENTIFIER_REQUIRED")
    @field:Size(max = 100, message = "IDENTIFIER_TOO_LONG")
    val identifier: String
)

data class VerifyIdentifierResponse(
    val exists: Boolean,
    val isAccountActive: Boolean = true,
    val status: AccountStatus? = null,
    val maskedIdentifier: String? = null,
    val role: UserRole? = null
)

data class SendEmailOtpRequest(
    @field:NotBlank(message = "EMAIL_REQUIRED")
    @field:Size(max = 100, message = "EMAIL_TOO_LONG")
    val email: String
)

data class SendEmailOtpResponse(
    val cooldownSeconds: Int = 60
)

data class RegisterStaffRequest(
    @field:NotNull(message = "ROLE_REQUIRED")
    val role: UserRole,

    @field:NotBlank(message = "NAME_REQUIRED")
    @field:Size(min = 2, max = 50, message = "NAME_INVALID_LENGTH")
    val name: String,

    @field:NotNull(message = "GENDER_REQUIRED")
    val gender: Gender,

    @field:NotBlank(message = "DOB_REQUIRED")
    val dateOfBirth: String,

    val ethnicity: String? = null,
    val ethnicityId: Long? = null,

    val school: String? = null,
    val department: String? = null,
    val hospital: String? = null,
    val hospitalDepartment: String? = null,

    @field:NotBlank(message = "WORKER_NUMBER_REQUIRED")
    @field:Size(min = 2, max = 30, message = "WORKER_NUMBER_INVALID_LENGTH")
    val workerNumber: String,

    @field:NotBlank(message = "ID_CARD_REQUIRED")
    val idCardNumber: String,

    @field:NotBlank(message = "EMAIL_REQUIRED")
    val email: String,

    @field:NotBlank(message = "OTP_REQUIRED")
    val emailOtp: String,

    @field:NotBlank(message = "PASSWORD_REQUIRED")
    @field:Size(min = 8, max = 64, message = "PASSWORD_INVALID_LENGTH")
    val password: String
)

data class RegisterResponse(
    val userId: Long,
    val email: String,
    val name: String,
    val role: UserRole,
    val status: AccountStatus = AccountStatus.PENDING_APPROVAL
)
