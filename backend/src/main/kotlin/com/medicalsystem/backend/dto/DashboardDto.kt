package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.UserRole

data class ProfileSummaryDto(
    val avatarUrl: String?,
    val name: String,
    val role: UserRole,
    val studentId: String? = null,
    val employeeId: String? = null,
    val school: String? = null,
    val department: String? = null
)
