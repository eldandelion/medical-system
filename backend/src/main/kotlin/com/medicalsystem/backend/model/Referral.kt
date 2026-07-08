package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class ReferralStep(
    val id: Long?,
    val type: ReferralStepType,
    val time: LocalDateTime,
    var status: ReferralStepStatus,
    val actorId: Long?
)

class Referral(
    val id: Long?,
    val studentId: Long,
    val type: ReferralType,
    val date: LocalDateTime,
    val title: String,
    val description: String,
    val riskLevel: RiskStatus,
    var status: ReferralStatus,
    val referredById: Long,
    val clinicalStatus: MutableList<ClinicalStatusType> = mutableListOf(),
    val severeRiskFactors: MutableList<RiskFlagName> = mutableListOf(),
    var destination: ReferralDestination? = null,
    val attachments: MutableList<Attachment> = mutableListOf(),
    val steps: MutableList<ReferralStep> = mutableListOf()
) : AggregateRoot() {
    fun transition(newStatus: ReferralStatus, actorId: Long? = null) {
        if (!newStatus.canTransitionFrom(this.status)) {
            throw com.medicalsystem.backend.exception.InvalidReferralTransitionException(this.status.name, newStatus.name)
        }

        val endStatus = if (newStatus == ReferralStatus.REJECTED || newStatus == ReferralStatus.RECALLED) {
            ReferralStepStatus.ISSUE
        } else {
            ReferralStepStatus.COMPLETED
        }

        this.steps.filter { it.status == ReferralStepStatus.ACTIVE }.forEach {
            it.status = endStatus
        }

        val oldStatus = this.status
        this.status = newStatus
        
        if (oldStatus != newStatus && this.id != null) {
            registerEvent(
                com.medicalsystem.backend.event.ReferralStatusChangedEvent(
                    referralId = this.id,
                    oldStatus = oldStatus,
                    newStatus = newStatus,
                    studentId = this.studentId
                )
            )
        }

        newStatus.requiresStepType?.let { stepType ->
            val step = ReferralStep(
                id = null,
                type = stepType,
                time = LocalDateTime.now(),
                status = ReferralStepStatus.ACTIVE,
                actorId = actorId
            )
            this.steps.add(step)
        }
    }
}
