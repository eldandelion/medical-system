package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.PsychometricTestType
import jakarta.persistence.*
import java.time.LocalDate

@Entity
@Table(name = "psychometric_tests")
data class PsychometricTestEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    @Column(name = "test_type", nullable = false)
    val testType: PsychometricTestType,

    @Column(nullable = false)
    val score: Int,

    @Column(nullable = false)
    val maxScore: Int,

    @Column(name = "test_date", nullable = false)
    val testDate: LocalDate,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "health_profile_id", nullable = false)
    val healthProfile: StudentHealthProfileEntity
)
