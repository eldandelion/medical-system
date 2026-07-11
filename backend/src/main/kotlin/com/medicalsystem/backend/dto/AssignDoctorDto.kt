package com.medicalsystem.backend.dto

import jakarta.validation.constraints.NotNull

data class AssignDoctorDto(
    @field:NotNull(message = "Doctor ID is required")
    val doctorId: Long
)
