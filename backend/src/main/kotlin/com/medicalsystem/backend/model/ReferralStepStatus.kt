package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ReferralStepStatus(val value: String) {
    COMPLETED("completed"),
    ISSUE("issue"),
    PENDING("pending"),
    ACTIVE("active");

    @JsonValue
    fun toValue(): String = value
}
