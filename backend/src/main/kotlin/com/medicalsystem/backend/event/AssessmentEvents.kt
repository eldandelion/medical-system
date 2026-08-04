package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.AssessmentScaleType
import java.time.LocalDateTime

data class AssessmentAssignedEvent(
    val assignmentId: Long,
    val studentId: Long,
    val assignedByUserId: Long,
    val scaleType: AssessmentScaleType,
    override val occurredOn: LocalDateTime = LocalDateTime.now()
) : DomainEvent

data class AssessmentCompletedEvent(
    val assignmentId: Long,
    val studentId: Long,
    val studentUserId: Long,
    val scaleType: AssessmentScaleType,
    val totalScore: Int,
    val maxScore: Int,
    val level: String,
    val isHighRisk: Boolean,
    val crisisFlags: List<String>,
    val completedAt: LocalDateTime,
    override val occurredOn: LocalDateTime = LocalDateTime.now()
) : DomainEvent
