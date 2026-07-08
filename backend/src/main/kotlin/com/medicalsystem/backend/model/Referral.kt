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

    fun getAllowedActions(user: User): List<ReferralAction> {
        val actions = mutableListOf<ReferralAction>()
        val isOwner = this.referredById == user.id

        when (user.role) {
            UserRole.TEACHER -> {
                if (isOwner) {
                    if (status == ReferralStatus.DRAFT) actions.addAll(listOf(ReferralAction.RECREATE, ReferralAction.DELETE_DRAFT))
                    if (status == ReferralStatus.RECALLED) actions.add(ReferralAction.RECREATE)
                    if (status == ReferralStatus.AWAITING_APPROVAL) actions.add(ReferralAction.RECALL_REFERRAL)
                }
            }
            UserRole.HEAD_COUNSELLOR -> {
                if (status == ReferralStatus.DRAFT && isOwner) actions.addAll(listOf(ReferralAction.RECREATE, ReferralAction.DELETE_DRAFT))
                if (status == ReferralStatus.AWAITING_APPROVAL) actions.addAll(listOf(ReferralAction.APPROVE_REFERRAL, ReferralAction.REJECT_REFERRAL))
                if (status == ReferralStatus.AWAITING_FEEDBACK_APPROVAL) actions.add(ReferralAction.ACKNOWLEDGE_FEEDBACK)
            }
            UserRole.TRIAL_ADMIN -> {
                if (status == ReferralStatus.AWAITING_TRIAGE) {
                    val isDoctorRejected = this.status == ReferralStatus.REJECTED
                    if (isDoctorRejected) {
                        actions.addAll(listOf(ReferralAction.REASSIGN_DOCTOR, ReferralAction.REJECT_REFERRAL))
                    } else {
                        actions.addAll(listOf(ReferralAction.ASSIGN_DOCTOR, ReferralAction.REJECT_REFERRAL))
                    }
                }
            }
            UserRole.DOCTOR -> {
                if (status == ReferralStatus.WAITING_FOR_SCHEDULING) actions.addAll(listOf(ReferralAction.SCHEDULE_APPOINTMENT, ReferralAction.REJECT_REFERRAL))
                if (status == ReferralStatus.WAITING_FOR_APPOINTMENT) actions.addAll(listOf(ReferralAction.WRITE_FEEDBACK, ReferralAction.REPORT_PROBLEM))
            }
            else -> {}
        }
        return actions
    }
}
