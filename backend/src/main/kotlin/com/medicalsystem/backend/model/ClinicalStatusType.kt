package com.medicalsystem.backend.model

enum class ClinicalStatusType(val value: String) {
    FIRST_VISIT("FirstVisit"),
    MEDICATED("Medicated"),
    PRIOR_THERAPY("PriorTherapy");

    fun toValue(): String = value
}
