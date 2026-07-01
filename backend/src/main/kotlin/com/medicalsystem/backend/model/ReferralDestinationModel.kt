package com.medicalsystem.backend.model

data class ReferralDestinationModel(
    val hospital: String,
    val department: String,
    val doctor: String,
    val admin: String,
    val transferDate: String?,
    val appointmentTime: String?
)
