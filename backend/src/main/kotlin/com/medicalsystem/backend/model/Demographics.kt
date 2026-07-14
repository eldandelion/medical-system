package com.medicalsystem.backend.model

import java.time.LocalDate

data class Demographics(
    val gender: Gender?,
    val dateOfBirth: LocalDate?,
    val ethnicity: Ethnicity?,
    val idCardNumber: String?,
    val contactNumber: String?,
    val email: String?,
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: String?,
    val school: School?
) {
    init {
        // Date of Birth cannot be in the future
        require(dateOfBirth == null || !dateOfBirth.isAfter(LocalDate.now())) {
            "Date of birth cannot be in the future."
        }

        // ID Card Number validation (Chinese ID: 18 chars, valid format)
        require(idCardNumber == null || idCardNumber.matches(Regex("^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"))) {
            "Invalid ID Card format."
        }

        // Email validation (Basic robust check)
        require(email == null || email.matches(Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$"))) {
            "Invalid email format."
        }

        // Contact Number validation (Chinese Mobile standard: 11 digits starting with 13-19)
        require(contactNumber == null || contactNumber.matches(Regex("^1[3-9]\\d{9}$"))) {
            "Contact number must be a valid 11-digit mobile number."
        }

        // Emergency Contact validation (Chinese Mobile standard or landline)
        require(emergencyContactPhone == null || emergencyContactPhone.matches(Regex("^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8})$"))) {
            "Emergency contact phone must be a valid phone number."
        }
    }
}
