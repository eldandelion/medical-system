package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.RiskStatus

@Entity
@Table(name = "students")
class StudentEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val studentNumber: String,

    @Column(nullable = false)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "major_id", nullable = false)
    var major: MajorEntity,

    @Column(nullable = false)
    var enrollmentDate: java.time.LocalDate,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var riskStatus: RiskStatus,

    @Embedded
    var demographics: StudentDemographics? = null,

    @Column(columnDefinition = "TEXT")
    var scidDiagnosis: String? = null,

    @OneToMany(mappedBy = "student", cascade = [CascadeType.ALL], orphanRemoval = true)
    var riskFlags: MutableList<RiskFlagEntity> = mutableListOf(),

    @OneToMany(mappedBy = "student", cascade = [CascadeType.ALL], orphanRemoval = true)
    var psychometricTests: MutableList<PsychometricTestEntity> = mutableListOf()
)
