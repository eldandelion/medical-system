package com.medicalsystem.backend.model

import java.time.LocalDate
import java.time.LocalDateTime

data class Hospital(
    val id: Long,
    val name: String,
    val address: String?,
    val contactPhone: String?
)

data class Department(
    val id: Long,
    val name: String,
    val hospitalId: Long
)

data class ReferralDestination(
    val hospitalId: Long?,
    val departmentId: Long?,
    val doctorId: Long?,
    val triageAdminId: Long?,
    val transferDate: LocalDate?
)

data class Attachment(
    val id: Long?,
    val name: String,
    val size: String
)
