package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ReferralType(val value: String) {
    INITIAL("初次转诊"),
    FOLLOW_UP("复诊转诊"),
    EMERGENCY("紧急转诊");

    @JsonValue
    fun toValue(): String = value
}
