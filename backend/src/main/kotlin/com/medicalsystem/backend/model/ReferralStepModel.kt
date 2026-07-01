package com.medicalsystem.backend.model

data class ReferralStepModel(
    val id: String,
    val type: String,
    val title: String,
    val subtitle: String?,
    val time: String,
    val status: String
)
