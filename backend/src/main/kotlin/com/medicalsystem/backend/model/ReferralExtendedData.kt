package com.medicalsystem.backend.model

data class ReferralExtendedData(
    val destination: ReferralDestinationModel? = null,
    val steps: List<ReferralStepModel>? = null
)
