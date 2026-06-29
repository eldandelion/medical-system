package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.RiskStatus

@Entity
@Table(name = "referral_entity")
class ReferralEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    var student: StudentEntity,

    @Column(nullable = false)
    var type: String,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false, length = 1000)
    var description: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var riskLevel: RiskStatus,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: ReferralStatus,

    @Column(nullable = false)
    var referredByName: String,

    @Column(nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now()
)
