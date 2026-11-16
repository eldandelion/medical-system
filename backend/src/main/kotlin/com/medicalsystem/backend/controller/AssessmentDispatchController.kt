package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AssessmentDispatchSummaryDto
import com.medicalsystem.backend.dto.ParticipationRecordDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.ResultSeverity
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.AssessmentDispatchService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/assessments")
class AssessmentDispatchController(
    private val assessmentDispatchService: AssessmentDispatchService
) {
    private fun requireStaffAccess(currentUser: User?) {
        val user = currentUser ?: throw ForbiddenException("Authorized user not found")
        if (user.role !in listOf(UserRole.TEACHER, UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN)) {
            throw ForbiddenException("Only educators and administrators can view assessment dispatches")
        }
    }

    @GetMapping("/dispatches/summary")
    fun getRecentDispatches(@CurrentUser currentUser: User?): ResponseEntity<List<AssessmentDispatchSummaryDto>> {
        requireStaffAccess(currentUser)
        return ResponseEntity.ok(assessmentDispatchService.getDispatchSummaries())
    }

    @GetMapping("/participation-records")
    fun getParticipationRecords(
        @CurrentUser currentUser: User?,
        @RequestParam(required = false) dispatchId: Long?,
        @RequestParam(required = false) studentName: String?,
        @RequestParam(required = false) studentNumber: String?,
        @RequestParam(required = false) severity: ResultSeverity?,
        pageable: Pageable
    ): ResponseEntity<Page<ParticipationRecordDto>> {
        requireStaffAccess(currentUser)
        return ResponseEntity.ok(
            assessmentDispatchService.getParticipationRecords(dispatchId, studentName, studentNumber, severity, pageable)
        )
    }
}
