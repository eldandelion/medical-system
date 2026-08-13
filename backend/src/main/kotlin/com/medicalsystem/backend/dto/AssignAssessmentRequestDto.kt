package com.medicalsystem.backend.dto

data class AssignAssessmentRequestDto(
    val studentId: Long,
    val batteryCode: String
)
