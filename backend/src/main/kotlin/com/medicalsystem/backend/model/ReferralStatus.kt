package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ReferralStatus(
    val value: String,
    val requiresStepType: ReferralStepType? = null
) {
    DRAFT("Draft", null),
    AWAITING_APPROVAL("AwaitingApproval", ReferralStepType.INITIATION),
    AWAITING_TRIAGE("AwaitingTriage", ReferralStepType.TRIAGE),
    WAITING_FOR_SCHEDULING("WaitingForScheduling", ReferralStepType.SCHEDULING),
    WAITING_FOR_APPOINTMENT("WaitingForAppointment", ReferralStepType.EVALUATION),
    AWAITING_FEEDBACK_APPROVAL("AwaitingFeedbackApproval", ReferralStepType.FEEDBACK),
    REJECTED("Rejected", null),
    RECALLED("Recalled", null),
    CLOSED("Closed", null),
    ERROR("Error", null);

    @JsonValue
    fun toValue(): String = value

    fun canTransitionFrom(previousStatus: ReferralStatus?): Boolean {
        // null means initial creation
        if (previousStatus == null) return this == DRAFT || this == AWAITING_APPROVAL
        
        return when (this) {
            DRAFT -> false
            AWAITING_APPROVAL -> previousStatus == DRAFT || previousStatus == RECALLED
            AWAITING_TRIAGE -> previousStatus == AWAITING_APPROVAL
            WAITING_FOR_SCHEDULING -> previousStatus == AWAITING_TRIAGE
            WAITING_FOR_APPOINTMENT -> previousStatus == WAITING_FOR_SCHEDULING
            AWAITING_FEEDBACK_APPROVAL -> previousStatus == WAITING_FOR_APPOINTMENT
            REJECTED -> previousStatus != CLOSED && previousStatus != DRAFT
            RECALLED -> previousStatus == AWAITING_APPROVAL
            CLOSED -> previousStatus == AWAITING_FEEDBACK_APPROVAL
            ERROR -> true
        }
    }
}
