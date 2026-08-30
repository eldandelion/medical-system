package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.ReferenceDataStatus
import jakarta.persistence.*

@Entity
@Table(name = "hospitals")
class HospitalEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false, length = 100)
    var name: String,
    
    @Column(length = 255)
    var address: String? = null,
    
    @Column(length = 20)
    var contactPhone: String? = null,

    @Column(name = "status", nullable = false)
    var status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE
)
