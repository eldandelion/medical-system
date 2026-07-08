package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.ReferralStepStatus
import com.medicalsystem.backend.model.ReferralStepType
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(name = "referral_steps", indexes = [Index(name = "idx_referral_step_ref_type", columnList = "referral_id, type")])
class ReferralStepEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "referral_id", nullable = false)
    var referral: ReferralEntity,

    @Column(nullable = false, length = 30)
    var type: ReferralStepType,

    @Column(nullable = false)
    var time: LocalDateTime,

    @Column(nullable = false, length = 30)
    var status: ReferralStepStatus,

    @Column(name = "actor_id")
    var actorId: Long? = null
)
