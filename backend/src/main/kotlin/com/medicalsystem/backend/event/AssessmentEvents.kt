package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.PsychometricTest
import java.time.LocalDateTime

data class AssessmentAssignedEvent(
    val assignmentId: Long,
    val studentId: Long,
    val assignedByUserId: Long,
    val batteryCode: String,
    override val occurredOn: LocalDateTime = LocalDateTime.now()
) : DomainEvent

data class AssessmentCompletedEvent(
    val assignmentId: Long,
    val studentId: Long,
    val batteryCode: String,
    val completedTests: List<PsychometricTest>,
    val completedAt: LocalDateTime,
    override val occurredOn: LocalDateTime = LocalDateTime.now()
) : DomainEvent
