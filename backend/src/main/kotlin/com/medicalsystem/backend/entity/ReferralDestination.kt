package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

@Embeddable
data class ReferralDestination(
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dest_hospital_id")
    var hospital: HospitalEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dest_department_id")
    var department: DepartmentEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dest_doctor_id")
    var doctor: DoctorEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dest_admin_id")
    var triageAdmin: TrialAdminEntity? = null,

    @Column(name = "dest_transfer_date")
    var transferDate: LocalDate? = null,

    @Column(name = "dest_appointment_time")
    var appointmentTime: LocalDateTime? = null
)
