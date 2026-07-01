package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.RiskStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class CreateReferralDto(
    @field:NotNull(message = "Student ID cannot be null")
    val studentId: Long,
    
    @field:NotBlank(message = "Action type cannot be blank")
    val actionType: String, // 'draft' or 'submit'
    
    @field:NotBlank(message = "Title cannot be blank")
    val title: String,
    
    @field:NotBlank(message = "Reason cannot be blank")
    val reason: String,
    
    @field:NotNull(message = "Risk level cannot be null")
    val riskLevel: RiskStatus,
    // Ignoring complex nested structures for now like clinicalStatus and severeRiskFactors
)
