package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.RiskStatus

@Entity
@Table(name = "student_health_profiles")
class StudentHealthProfileEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "student_id", unique = true, nullable = false)
    val studentId: Long,

    @Column(nullable = false)
    var riskStatus: RiskStatus = RiskStatus.LOW,

    @Column(columnDefinition = "TEXT")
    var scidDiagnosis: String? = null,

    @OneToMany(mappedBy = "healthProfile", cascade = [CascadeType.ALL], orphanRemoval = true)
    var riskFlags: MutableList<RiskFlagEntity> = mutableListOf(),

    @OneToMany(mappedBy = "healthProfile", cascade = [CascadeType.ALL], orphanRemoval = true)
    var psychometricTests: MutableList<PsychometricTestEntity> = mutableListOf()
)
