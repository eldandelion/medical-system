package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.AssessmentDispatchSummaryDto
import com.medicalsystem.backend.dto.ParticipationRecordDto
import com.medicalsystem.backend.model.ResultSeverity
import com.medicalsystem.backend.repository.AssessmentDispatchJpaRepository
import com.medicalsystem.backend.repository.AssessmentAssignmentJpaRepository
import com.medicalsystem.backend.repository.ParticipationRecordSpecification
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AssessmentDispatchService(
    private val dispatchRepository: AssessmentDispatchJpaRepository,
    private val assignmentRepository: AssessmentAssignmentJpaRepository
) {
    @Transactional(readOnly = true)
    fun getDispatchSummaries(): List<AssessmentDispatchSummaryDto> {
        return dispatchRepository.findAll().map { dispatch ->
            AssessmentDispatchSummaryDto(
                id = dispatch.id!!,
                batteryCode = dispatch.batteryCode,
                dispatchedAt = dispatch.dispatchedAt,
                dispatchedByName = dispatch.dispatchedByUser.name
            )
        }.sortedByDescending { it.dispatchedAt }
    }

    @Transactional(readOnly = true)
    fun getParticipationRecords(
        dispatchId: Long?,
        studentName: String?,
        studentNumber: String?,
        severity: ResultSeverity?,
        pageable: Pageable
    ): Page<ParticipationRecordDto> {
        val spec = ParticipationRecordSpecification.withFilters(dispatchId, studentName, studentNumber, severity)
        val assignments = assignmentRepository.findAll(spec, pageable)
        return assignments.map { assignment ->
            ParticipationRecordDto(
                assignmentId = assignment.id!!,
                studentId = assignment.student.id!!,
                studentName = assignment.student.name,
                studentNumber = assignment.student.studentNumber,
                status = assignment.status,
                severity = assignment.severity,
                assessmentName = assignment.batteryCode,
                dispatchedAt = assignment.dispatch?.dispatchedAt ?: assignment.assignedAt
            )
        }
    }
}
