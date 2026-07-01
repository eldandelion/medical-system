package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ReferralStepType(val value: String) {
    INITIATION("initiation"),
    REVIEW("review"),
    TRIAGE("triage"),
    SCHEDULING("scheduling"),
    EVALUATION("evaluation"),
    FEEDBACK("feedback");

    @JsonValue
    fun toValue(): String = value
}
