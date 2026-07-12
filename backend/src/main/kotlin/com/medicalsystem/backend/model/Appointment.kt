package com.medicalsystem.backend.model

import java.time.Instant

enum class AppointmentStatus {
    SCHEDULED,
    COMPLETED,
    CANCELLED
}

data class Appointment(
    val doctorId: Long,
    val appointmentTime: Instant,
    val status: AppointmentStatus = AppointmentStatus.SCHEDULED
)
