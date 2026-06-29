package com.medicalsystem.backend.dto

import java.time.LocalDate
import com.medicalsystem.backend.model.RiskStatus

import com.medicalsystem.backend.model.AcademicYear

data class StudentDto(
    val id: String?,
    val studentNumber: String,
    val name: String,
    val majorId: Long?,
    val major: String?,
    val enrollmentDate: LocalDate,
    val year: AcademicYear?,
    val riskLevel: RiskStatus?,
    val status: String = "Active",
    val demographics: DemographicsDto? = null
)
