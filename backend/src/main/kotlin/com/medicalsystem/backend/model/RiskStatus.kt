package com.medicalsystem.backend.model

enum class RiskStatus(val value: String) {
    HIGH("High"),
    MEDIUM("Medium"),
    LOW("Low");

    fun toValue(): String = value
}
