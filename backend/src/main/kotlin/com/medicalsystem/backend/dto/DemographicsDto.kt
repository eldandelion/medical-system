package com.medicalsystem.backend.dto

import jakarta.validation.constraints.Email

data class DemographicsDto(
    val gender: String?,
    val age: Int?,
    val ethnicity: String?,
    val idCardNumber: String?,
    val contactNumber: String?,
    
    @field:Email(message = "Invalid email format")
    val email: String?,
    
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: String?,
    val school: String?
)
