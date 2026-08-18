package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.UserRole
import java.time.Instant

data class AdminUserSummaryDto(
    val id: Long,
    val name: String,
    val email: String,
    val role: UserRole,
    val status: AccountStatus,
    val employeeOrStudentId: String? = null,
    val departmentOrCollege: String? = null,
    val hospital: String? = null,
    val deletedAt: Instant? = null
)

data class UpdateAccountStatusRequest(
    val status: AccountStatus,
    val reason: String? = null
)

data class ToggleScaleAvailabilityRequest(
    val isAvailable: Boolean
)
