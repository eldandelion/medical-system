package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class RiskStatus(val value: String) {
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    @JsonValue
    fun toValue(): String = value
}
