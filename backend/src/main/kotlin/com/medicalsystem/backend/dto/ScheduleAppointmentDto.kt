package com.medicalsystem.backend.dto

import java.time.LocalDateTime
import jakarta.validation.constraints.Future
import jakarta.validation.constraints.NotNull

data class ScheduleAppointmentDto(
    @field:NotNull(message = "Appointment time is required")
    @field:Future(message = "Appointment time must be in the future")
    val appointmentTime: LocalDateTime? = null
)
