package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
import com.medicalsystem.backend.model.RiskStatus

@Entity
@Table(name = "referral_entity", indexes = [Index(name = "idx_referral_student_status", columnList = "student_id, status")])
class ReferralEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "student_id", nullable = false)
    var studentId: Long,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var type: ReferralType,

    @Column(nullable = false)
    var title: String,

    @Column(nullable = false, length = 1000)
    var description: String,

    @Column(nullable = false)
    var riskLevel: RiskStatus,

    @Column(nullable = false)
    var status: ReferralStatus,

    @Column(name = "referred_by_id", nullable = false)
    var referredById: Long,

    @Column(nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Embedded
    var destination: ReferralDestinationEntity? = null,

    @ElementCollection
    @CollectionTable(name = "referral_clinical_status", joinColumns = [JoinColumn(name = "referral_id")])
    @Column(name = "clinical_status")
    var clinicalStatus: MutableList<com.medicalsystem.backend.model.ClinicalStatusType> = mutableListOf(),

    @ElementCollection
    @CollectionTable(name = "referral_severe_risk_factors", joinColumns = [JoinColumn(name = "referral_id")])
    @Column(name = "risk_flag_name")
    var severeRiskFactors: MutableList<com.medicalsystem.backend.model.RiskFlagName> = mutableListOf(),

    @OneToMany(mappedBy = "referral", cascade = [CascadeType.ALL], orphanRemoval = true)
    var attachments: MutableSet<AttachmentEntity> = mutableSetOf(),

    @OneToMany(mappedBy = "referral", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    var steps: MutableSet<ReferralStepEntity> = mutableSetOf(),

    @OneToOne(mappedBy = "referral", cascade = [CascadeType.ALL], orphanRemoval = true)
    var appointment: AppointmentEntity? = null,

    @OneToOne(mappedBy = "referral", cascade = [CascadeType.ALL], orphanRemoval = true)
    var feedback: ReferralFeedbackEntity? = null
) {

    fun transition(newStatus: ReferralStatus, actorId: Long? = null) {
        require(newStatus.canTransitionFrom(this.status)) {
            "Invalid transition from ${this.status} to $newStatus"
        }

        val endStatus = if (newStatus == ReferralStatus.REJECTED || newStatus == ReferralStatus.RECALLED) {
            com.medicalsystem.backend.model.ReferralStepStatus.ISSUE
        } else {
            com.medicalsystem.backend.model.ReferralStepStatus.COMPLETED
        }

        this.steps.filter { it.status == com.medicalsystem.backend.model.ReferralStepStatus.ACTIVE }.forEach {
            it.status = endStatus
        }

        this.status = newStatus

        newStatus.requiresStepType?.let { stepType ->
            val step = ReferralStepEntity(
                referral = this,
                type = stepType,
                time = LocalDateTime.now(),
                status = com.medicalsystem.backend.model.ReferralStepStatus.ACTIVE,
                actorId = actorId
            )
            this.steps.add(step)
        }
    }
}
