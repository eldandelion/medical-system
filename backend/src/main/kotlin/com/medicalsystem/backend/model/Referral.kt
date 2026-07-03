package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class ReferralStep(
    val id: Long?,
    val type: ReferralStepType,
    val title: String,
    val subtitle: String?,
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
) {
    fun transition(newStatus: ReferralStatus, title: String, subtitle: String? = null, actorId: Long? = null) {
        require(newStatus.canTransitionFrom(this.status)) {
            "Invalid transition from ${this.status} to $newStatus"
        }

        val endStatus = if (newStatus == ReferralStatus.REJECTED || newStatus == ReferralStatus.RECALLED) {
            ReferralStepStatus.ISSUE
        } else {
            ReferralStepStatus.COMPLETED
        }

        this.steps.filter { it.status == ReferralStepStatus.ACTIVE }.forEach {
            it.status = endStatus
        }

        this.status = newStatus

        newStatus.requiresStepType?.let { stepType ->
            val step = ReferralStep(
                id = null,
                type = stepType,
                title = title,
                subtitle = subtitle,
                time = LocalDateTime.now(),
                status = ReferralStepStatus.ACTIVE,
                actorId = actorId
            )
            this.steps.add(step)
        }
    }
}
