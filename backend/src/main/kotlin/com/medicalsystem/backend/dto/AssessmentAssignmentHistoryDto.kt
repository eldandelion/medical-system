package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AssessmentStatus
import java.time.LocalDateTime

data class AssessmentAssignmentHistoryDto(
    val id: Long,
    val batteryCode: String,
    val assignedByName: String,
    val assignedById: Long,
    val status: AssessmentStatus,
    val assignedAt: LocalDateTime,
    val completedAt: LocalDateTime? = null,
    val revokedAt: LocalDateTime? = null
)
