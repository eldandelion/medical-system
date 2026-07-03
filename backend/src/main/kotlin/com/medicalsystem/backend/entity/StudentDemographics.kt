package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.Gender
import jakarta.persistence.*
import java.time.LocalDate

@Embeddable
data class StudentDemographics(
    @Column(length = 20)
    var gender: Gender? = null,

    @Column(name = "date_of_birth")
    var dateOfBirth: LocalDate? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ethnicity_id")
    var ethnicity: EthnicityEntity? = null,

    @Column(length = 18, unique = true)
    var idCardNumber: String? = null,

    @Column(length = 20)
    var contactNumber: String? = null,

    @Column(length = 100)
    var email: String? = null,

    @Column(length = 255)
    var homeAddress: String? = null,

    @Column(length = 100)
    var emergencyContactName: String? = null,

    @Column(length = 20)
    var emergencyContactPhone: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id")
    var school: SchoolEntity? = null
)
