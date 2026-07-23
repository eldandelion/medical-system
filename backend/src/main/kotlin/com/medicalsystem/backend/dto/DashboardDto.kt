package com.medicalsystem.backend.dto

data class ProfileSummaryDto(
    val avatarText: String,
    val title: String,
    val subtitle: String,
    val studentId: String? = null,
    val employeeId: String? = null,
    val school: String? = null,
    val department: String? = null
)
