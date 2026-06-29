package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.FlagStatus
import jakarta.persistence.*

@Entity
@Table(name = "risk_flags")
data class RiskFlagEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val name: com.medicalsystem.backend.model.RiskFlagName,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val status: FlagStatus,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    val student: StudentEntity
)
