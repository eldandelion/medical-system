package com.medicalsystem.backend.model

enum class ReferralStepType(val value: String) {
    INITIATION("initiation"),
    REVIEW("review"),
    TRIAGE("triage"),
    SCHEDULING("scheduling"),
    EVALUATION("evaluation"),
    FEEDBACK("feedback");

    fun toValue(): String = value
}
