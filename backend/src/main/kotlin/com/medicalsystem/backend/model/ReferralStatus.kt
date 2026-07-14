package com.medicalsystem.backend.model

enum class ReferralStatus(
    val requiresStepType: ReferralStepType? = null
) {
    DRAFT(ReferralStepType.INITIATION),
    AWAITING_APPROVAL(ReferralStepType.REVIEW),
    AWAITING_TRIAGE(ReferralStepType.TRIAGE),
    WAITING_FOR_SCHEDULING(ReferralStepType.SCHEDULING),
    WAITING_FOR_APPOINTMENT(ReferralStepType.EVALUATION),
    AWAITING_FEEDBACK_APPROVAL(ReferralStepType.FEEDBACK),
    NEEDS_REASSIGNMENT(ReferralStepType.TRIAGE),
    REJECTED(null),
    RECALLED(null),
    CLOSED(null),
    ERROR(null);

    fun canTransitionFrom(previousStatus: ReferralStatus?): Boolean {
        // null means initial creation
        if (previousStatus == null) return this == DRAFT || this == AWAITING_APPROVAL
        
        return when (this) {
            DRAFT -> false
            AWAITING_APPROVAL -> previousStatus == DRAFT || previousStatus == RECALLED
            AWAITING_TRIAGE -> previousStatus == AWAITING_APPROVAL || previousStatus == DRAFT
            WAITING_FOR_SCHEDULING -> previousStatus == AWAITING_TRIAGE || previousStatus == NEEDS_REASSIGNMENT
            WAITING_FOR_APPOINTMENT -> previousStatus == WAITING_FOR_SCHEDULING
            AWAITING_FEEDBACK_APPROVAL -> previousStatus == WAITING_FOR_APPOINTMENT
            NEEDS_REASSIGNMENT -> previousStatus == WAITING_FOR_SCHEDULING
            REJECTED -> previousStatus != CLOSED && previousStatus != DRAFT
            RECALLED -> previousStatus == AWAITING_APPROVAL
            CLOSED -> previousStatus == AWAITING_FEEDBACK_APPROVAL
            ERROR -> true
        }
    }
}
