package com.medicalsystem.backend.dto



data class DemographicsDto(
    val gender: String?,
    val age: Int?,
    val ethnicity: String?,
    val idCardNumber: String?,
    val contactNumber: String?,
    
    val email: com.medicalsystem.backend.model.EmailAddress?,
    
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: String?,
    val school: String?
)
