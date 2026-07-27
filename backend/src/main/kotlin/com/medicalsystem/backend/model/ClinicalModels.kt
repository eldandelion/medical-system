package com.medicalsystem.backend.model

import java.time.LocalDate
import java.time.LocalDateTime

@JvmInline
value class HospitalId(val value: Long) {
    init { require(value > 0) { "HospitalId must be positive" } }
}

@JvmInline
value class HospitalDepartmentId(val value: Long) {
    init { require(value > 0) { "HospitalDepartmentId must be positive" } }
}

@JvmInline
value class DoctorId(val value: Long) {
    init { require(value > 0) { "DoctorId must be positive" } }
}

@JvmInline
value class TriageAdminId(val value: Long) {
    init { require(value > 0) { "TriageAdminId must be positive" } }
}

data class Hospital(
    val id: HospitalId,
    val name: String,
    val address: String?,
    val contactPhone: PhoneNumber?
) {
    init {
        require(name.isNotBlank()) { "Hospital name cannot be blank" }
    }
}

data class HospitalDepartment(
    val id: HospitalDepartmentId,
    val name: String,
    val hospitalId: HospitalId
) {
    init {
        require(name.isNotBlank()) { "HospitalDepartment name cannot be blank" }
    }
}

sealed interface ReferralDestination {
    val transferDate: LocalDate?

    /**
     * Initial state: The referral has been submitted and a hospital was assigned,
     * but it has not yet been processed by a Triage Admin.
     */
    data class Submitted(
        val hospitalId: HospitalId,
        override val transferDate: LocalDate?
    ) : ReferralDestination

    /**
     * Finalized state: A Triage Admin has reviewed the referral and assigned
     * a specific department and doctor within the hospital.
     */
    data class Triaged(
        val hospitalId: HospitalId,
        val triageAdminId: TriageAdminId,
        val departmentId: HospitalDepartmentId,
        val doctorId: DoctorId,
        override val transferDate: LocalDate?
    ) : ReferralDestination
}
