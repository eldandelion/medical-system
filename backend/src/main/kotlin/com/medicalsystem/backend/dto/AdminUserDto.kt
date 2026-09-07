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

data class UserAffiliationDto(
    val identifier: String? = null,
    val primaryOrganization: String? = null,
    val departmentOrMajor: String? = null,
    val titleOrDegree: String? = null,
    val enrollmentYear: Int? = null
)

data class AdminUserDetailsDto(
    val id: Long,
    val name: String,
    val email: String,
    val role: UserRole,
    val status: AccountStatus,
    val employeeOrStudentId: String? = null,
    val departmentOrCollege: String? = null,
    val hospital: String? = null,
    val deletedAt: Instant? = null,
    val affiliation: UserAffiliationDto = UserAffiliationDto(),
    val demographics: DemographicsDto? = null,
    val contactNumber: String? = null,
    val homeAddress: String? = null
)

data class UpdateAccountStatusRequest(
    val status: AccountStatus,
    val reason: String? = null
)

data class ToggleScaleAvailabilityRequest(
    val isAvailable: Boolean
)
