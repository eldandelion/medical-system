package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.ReferralStepStatus
import com.medicalsystem.backend.model.ReferralStepType
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "referral_steps")
class ReferralStepEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_id", nullable = false)
    var referral: ReferralEntity,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var type: ReferralStepType,

    @Column(nullable = false, length = 100)
    var title: String,

    @Column(length = 255)
    var subtitle: String? = null,

    @Column(nullable = false)
    var time: LocalDateTime,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    var status: ReferralStepStatus,

    @Column(name = "actor_id")
    var actorId: Long? = null
)
