package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class ReferralStep(
    val id: Long?,
    val type: ReferralStepType,
    val time: LocalDateTime,
    var status: ReferralStepStatus,
    val actorId: Long?,
    var reason: String? = null
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
    var appointment: Appointment? = null,
    var feedback: ReferralFeedback? = null,
    val attachments: MutableList<ReferralAttachment> = mutableListOf(),
    val steps: MutableList<ReferralStep> = mutableListOf()
) : AggregateRoot() {
    fun transition(newStatus: ReferralStatus, actorId: Long? = null, reason: String? = null) {
        if (!newStatus.canTransitionFrom(this.status)) {
            throw com.medicalsystem.backend.exception.InvalidReferralTransitionException(this.status.name, newStatus.name)
        }

        if (newStatus == ReferralStatus.AWAITING_TRIAGE || newStatus == ReferralStatus.WAITING_FOR_SCHEDULING) {
            if (this.destination == null) {
                throw com.medicalsystem.backend.exception.ValidationException("Referral must have an assigned hospital destination before moving past approval")
            }
        }

        val endStatus = if (newStatus == ReferralStatus.REJECTED || newStatus == ReferralStatus.RECALLED || newStatus == ReferralStatus.NEEDS_REASSIGNMENT) {
            ReferralStepStatus.ISSUE
        } else {
            ReferralStepStatus.COMPLETED
        }

        this.steps.filter { it.status == ReferralStepStatus.ACTIVE }.forEach {
            it.status = endStatus
            if (endStatus == ReferralStepStatus.ISSUE && reason != null) {
                it.reason = reason
            }
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
                actorId = actorId,
                reason = reason
            )
            this.steps.add(step)
        }
    }

    fun submit(actorRole: UserRole, actorId: Long) {
        if (this.status != ReferralStatus.DRAFT) {
            throw com.medicalsystem.backend.exception.ValidationException("Only drafts can be submitted")
        }
        
        // Everyone, including Head Counsellors, submits to AWAITING_APPROVAL first, 
        // to ensure they explicitly select a hospital through the approval process.
        this.transition(ReferralStatus.AWAITING_APPROVAL, actorId = actorId)
    }

    fun approve(hospitalId: HospitalId, actorId: Long) {
        if (this.status != ReferralStatus.AWAITING_APPROVAL) {
            throw com.medicalsystem.backend.exception.ValidationException("Only referrals awaiting approval can be approved")
        }
        
        this.destination = ReferralDestination.Submitted(
            hospitalId = hospitalId,
            transferDate = null
        )
        
        this.transition(ReferralStatus.AWAITING_TRIAGE, actorId = actorId)
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
                if (status == ReferralStatus.AWAITING_FEEDBACK_APPROVAL) actions.addAll(listOf(ReferralAction.ACKNOWLEDGE_FEEDBACK, ReferralAction.REQUEST_FEEDBACK_REVISION))
            }
            UserRole.TRIAL_ADMIN -> {
                if (status == ReferralStatus.AWAITING_TRIAGE) {
                    actions.addAll(listOf(ReferralAction.ASSIGN_DOCTOR, ReferralAction.REJECT_REFERRAL))
                } else if (status == ReferralStatus.NEEDS_REASSIGNMENT) {
                    actions.addAll(listOf(ReferralAction.REASSIGN_DOCTOR, ReferralAction.REJECT_REFERRAL))
                }
            }
            UserRole.DOCTOR -> {
                if (status == ReferralStatus.WAITING_FOR_SCHEDULING) actions.addAll(listOf(ReferralAction.SCHEDULE_APPOINTMENT, ReferralAction.REQUEST_REASSIGNMENT))
                if (status == ReferralStatus.WAITING_FOR_APPOINTMENT) actions.addAll(listOf(ReferralAction.WRITE_FEEDBACK, ReferralAction.REPORT_PROBLEM, ReferralAction.RESCHEDULE_APPOINTMENT))
            }
            else -> {}
        }
        return actions
    }

    fun scheduleAppointment(doctorId: Long, time: LocalDateTime, actorId: Long) {
        if (this.status != ReferralStatus.WAITING_FOR_SCHEDULING) {
            throw com.medicalsystem.backend.exception.ValidationException("Appointment can only be scheduled for referrals waiting for scheduling")
        }
        
        val destDoctorId = (this.destination as? ReferralDestination.Triaged)?.doctorId?.value
        if (destDoctorId != doctorId) {
            throw com.medicalsystem.backend.exception.ValidationException("Doctor ID does not match the assigned doctor in destination")
        }
        
        this.appointment = Appointment(
            doctorId = doctorId,
            appointmentTime = time.toInstant(java.time.ZoneOffset.UTC),
            status = AppointmentStatus.SCHEDULED
        )
        
        this.transition(ReferralStatus.WAITING_FOR_APPOINTMENT, actorId = actorId)
        
        if (this.id != null) {
            registerEvent(
                com.medicalsystem.backend.event.AppointmentScheduledEvent(
                    referralId = this.id,
                    studentId = this.studentId,
                    doctorId = doctorId,
                    appointmentTime = time
                )
            )
        }
    }

    fun acknowledgeFeedback(actorId: Long) {
        if (this.status != ReferralStatus.AWAITING_FEEDBACK_APPROVAL) {
            throw com.medicalsystem.backend.exception.ValidationException("Only referrals awaiting feedback approval can be acknowledged")
        }
        
        this.transition(ReferralStatus.CLOSED, actorId = actorId)
    }

    fun addFeedback(content: String, attachments: List<FeedbackAttachment>, actorId: Long) {
        if (this.status != ReferralStatus.WAITING_FOR_APPOINTMENT) {
            throw com.medicalsystem.backend.exception.ReferralStateException("Invalid state: ${this.status}, expected WAITING_FOR_APPOINTMENT")
        }
        if (this.appointment?.doctorId != actorId) {
            throw com.medicalsystem.backend.exception.ForbiddenException("Doctor is not assigned to this referral")
        }
        
        this.feedback = ReferralFeedback(
            referralId = this.id ?: 0,
            content = content,
            attachments = attachments
        )
        
        this.transition(ReferralStatus.AWAITING_FEEDBACK_APPROVAL, actorId = actorId)
    }

    fun recall(actorId: Long) {
        if (status != ReferralStatus.AWAITING_APPROVAL) {
            throw com.medicalsystem.backend.exception.ValidationException("Only referrals awaiting approval can be recalled")
        }
        
        transition(ReferralStatus.RECALLED, actorId = actorId)
        
        id?.let {
            registerEvent(
                com.medicalsystem.backend.event.ReferralRecalledEvent(
                    referralId = it,
                    studentId = studentId
                )
            )
        }
    }
}
