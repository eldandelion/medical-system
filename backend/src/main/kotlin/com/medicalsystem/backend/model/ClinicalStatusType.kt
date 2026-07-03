package com.medicalsystem.backend.model

import com.fasterxml.jackson.annotation.JsonValue

enum class ClinicalStatusType(val value: String) {
    FIRST_VISIT("FirstVisit"),
    MEDICATED("Medicated"),
    PRIOR_THERAPY("PriorTherapy");

    @JsonValue
    fun toValue(): String = value
}
