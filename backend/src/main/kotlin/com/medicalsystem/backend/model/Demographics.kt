package com.medicalsystem.backend.model

import java.time.LocalDate

data class Demographics(
    val gender: Gender?,
    val dateOfBirth: LocalDate?,
    val ethnicity: Ethnicity?,
    val idCardNumber: IdCardNumber?,
    val contactNumber: MobileNumber?,
    val email: EmailAddress?,
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: PhoneNumber?,
    val school: School?
) {
    init {
        // Date of Birth cannot be in the future
        require(dateOfBirth == null || !dateOfBirth.isAfter(LocalDate.now())) {
            "Date of birth cannot be in the future."
        }
    }
}
