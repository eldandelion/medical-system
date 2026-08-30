package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.ReferenceDataStatus
import jakarta.persistence.*

@Entity
@Table(name = "degree_levels")
class DegreeLevelEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false, length = 50)
    var name: String,

    @Column(name = "status", nullable = false)
    var status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE
)
