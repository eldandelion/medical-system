package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AssessmentStatus
import com.medicalsystem.backend.model.ResultSeverity
import java.time.LocalDateTime

data class AssessmentDispatchSummaryDto(
    val id: Long,
    val batteryCode: String,
    val dispatchedAt: LocalDateTime,
    val dispatchedByName: String
)

data class ParticipationRecordDto(
    val assignmentId: Long,
    val studentName: String,
    val studentNumber: String,
    val status: AssessmentStatus,
    val severity: ResultSeverity
)
