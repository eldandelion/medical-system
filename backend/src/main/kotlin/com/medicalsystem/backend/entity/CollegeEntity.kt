package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.ReferenceDataStatus
import jakarta.persistence.*

@Entity
@Table(name = "college_entity")
class CollegeEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true)
    var name: String,

    @Column(name = "status", nullable = false)
    var status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE
)
