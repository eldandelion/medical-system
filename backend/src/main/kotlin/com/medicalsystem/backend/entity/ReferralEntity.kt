package com.medicalsystem.backend.entity

import jakarta.persistence.*
import java.time.LocalDateTime
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
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

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var type: ReferralType,

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
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Embedded
    var destination: ReferralDestination? = null,

    @OneToMany(mappedBy = "referral", cascade = [CascadeType.ALL], orphanRemoval = true)
    var steps: MutableList<ReferralStepEntity> = mutableListOf()
) {

    fun transition(newStatus: ReferralStatus, title: String, subtitle: String? = null, actor: AdminEntity? = null) {
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
                title = title,
                subtitle = subtitle,
                time = LocalDateTime.now(),
                status = com.medicalsystem.backend.model.ReferralStepStatus.ACTIVE,
                actor = actor
            )
            this.steps.add(step)
        }
    }
}
