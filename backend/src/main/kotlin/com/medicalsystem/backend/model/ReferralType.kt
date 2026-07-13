package com.medicalsystem.backend.model

enum class ReferralType(val value: String) {
    INITIAL("初次转诊"),
    FOLLOW_UP("复诊转诊"),
    EMERGENCY("紧急转诊");

    fun toValue(): String = value
}
