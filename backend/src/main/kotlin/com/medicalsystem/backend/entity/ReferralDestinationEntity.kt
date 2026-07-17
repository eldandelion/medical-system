package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDate

@Embeddable
data class ReferralDestinationEntity(
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
    var transferDate: LocalDate? = null
)
