package com.medicalsystem.backend.dto

data class HospitalDto(
    val id: Long,
    val name: String,
    val address: String?,
    val contactPhone: String?,
    val hasTrialAdmin: Boolean
)
