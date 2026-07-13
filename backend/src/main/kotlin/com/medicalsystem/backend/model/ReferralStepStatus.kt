package com.medicalsystem.backend.model

enum class ReferralStepStatus(val value: String) {
    COMPLETED("completed"),
    ISSUE("issue"),
    PENDING("pending"),
    ACTIVE("active");

    fun toValue(): String = value
}
