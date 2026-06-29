package com.medicalsystem.backend.entity

import jakarta.persistence.Embeddable
import java.time.LocalDate

@Embeddable
data class StudentDemographics(
    var gender: String? = null,
    var dateOfBirth: LocalDate? = null,
    var ethnicity: String? = null,
    var idCardNumber: String? = null,
    var contactNumber: String? = null,
    var email: String? = null,
    var homeAddress: String? = null,
    var emergencyContactName: String? = null,
    var emergencyContactPhone: String? = null,
    var school: String? = null
)
