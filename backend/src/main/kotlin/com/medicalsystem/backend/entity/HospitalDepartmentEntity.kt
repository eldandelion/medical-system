package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.ReferenceDataStatus
import jakarta.persistence.*

@Entity
@Table(name = "hospital_departments")
class HospitalDepartmentEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", nullable = false)
    var hospital: HospitalEntity,

    @Column(name = "status", nullable = false)
    var status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE
)
