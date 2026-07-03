package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.TestResultName
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "psychometric_tests")
data class PsychometricTestEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    val testResultName: TestResultName,

    @Column(nullable = false)
    val score: Int,

    @Column(nullable = false)
    val maxScore: Int,

    @Column(nullable = false)
    val level: String,

    @Column(nullable = false)
    val testDate: LocalDate,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_profile_id", nullable = false)
    var healthProfile: StudentHealthProfileEntity? = null
)
