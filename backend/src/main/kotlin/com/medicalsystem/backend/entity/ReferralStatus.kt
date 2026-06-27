package com.medicalsystem.backend.entity

import com.fasterxml.jackson.annotation.JsonValue

enum class ReferralStatus(val value: String) {
    DRAFT("Draft"),
    CLOSED("Closed"),
    AWAITING_TRIAGE("AwaitingTriage"),
    AWAITING_APPROVAL("AwaitingApproval"),
    RECALLED("Recalled"),
    AWAITING_FEEDBACK_APPROVAL("AwaitingFeedbackApproval"),
    ERROR("Error"),
    REJECTED("Rejected"),
    WAITING_FOR_SCHEDULING("WaitingForScheduling"),
    WAITING_FOR_APPOINTMENT("WaitingForAppointment");

    @JsonValue
    fun toValue(): String = value
}
