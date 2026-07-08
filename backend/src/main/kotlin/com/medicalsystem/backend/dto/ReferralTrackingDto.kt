package com.medicalsystem.backend.dto

data class ReferralTrackingDto(
    val destination: DestinationDto?,
    val steps: List<ReferralStepDto>?
)

data class DestinationDto(
    val hospital: String,
    val department: String,
    val doctor: String,
    val admin: String,
    val transferDate: String?,
    val appointmentTime: String?
)

data class ReferralStepDto(
    val id: String,
    val type: String,
    val time: String,
    val status: String
)
