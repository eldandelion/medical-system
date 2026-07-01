package com.medicalsystem.backend.model

import java.time.LocalDate

data class Demographics(
    val gender: Gender?,
    val dateOfBirth: LocalDate?,
    val ethnicity: String?,
    val idCardNumber: String?,
    val contactNumber: String?,
    val email: String?,
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: String?,
    val school: String?
)
