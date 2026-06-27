package com.medicalsystem.backend.dto

import java.time.LocalDate
import com.medicalsystem.backend.entity.RiskStatus

data class StudentDto(
    val id: String?,
    val studentNumber: String,
    val name: String,
    val majorId: Long?,
    val major: String?,
    val enrollmentDate: LocalDate,
    val year: String?,
    val riskLevel: RiskStatus?,
    val status: String = "Active"
)
