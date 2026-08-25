package com.medicalsystem.backend.dto

import java.time.LocalDate
import com.medicalsystem.backend.model.RiskStatus
import jakarta.validation.Valid
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class StudentDto(
    val id: String?,
    
    @field:NotBlank(message = "Student number cannot be blank")
    val studentNumber: String,
    
    @field:NotBlank(message = "Name cannot be blank")
    val name: String,
    
    @field:NotNull(message = "Major ID cannot be null")
    val majorId: Long?,
    
    val major: String?,
    
    @field:NotNull(message = "Enrollment date cannot be null")
    val enrollmentDate: LocalDate,
    
    val degreeLevel: String? = null,
    val degreeLevelId: Long? = null,
    val riskLevel: RiskStatus?,
    val status: String = "Active",
    
    @field:Valid
    val demographics: DemographicsDto? = null
)
