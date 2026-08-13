package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AssessmentAssignmentHistoryDto
import com.medicalsystem.backend.dto.AssignAssessmentRequestDto
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.service.AssessmentAssignmentService
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.model.User
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository

@RestController
@RequestMapping("/api/assessments")
class AssessmentAssignmentController(
    private val assessmentAssignmentService: AssessmentAssignmentService,
    private val assessmentAssignmentRepository: AssessmentAssignmentRepository,
    private val userRepository: UserRepository
) {
    @PostMapping("/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    fun assignAssessment(
        @CurrentUser currentUser: User?,
        @RequestBody request: AssignAssessmentRequestDto
    ): ResponseEntity<AssessmentAssignmentHistoryDto> {
        val user = currentUser ?: throw com.medicalsystem.backend.exception.ForbiddenException("Authorized user not found")
        val assignment = assessmentAssignmentService.assignAssessment(
            studentId = request.studentId,
            assignedByUserId = user.id,
            batteryCode = request.batteryCode
        )
        val userEntity = userRepository.findById(user.id).orElseThrow()
        
        val dto = AssessmentAssignmentHistoryDto(
            id = assignment.id!!,
            batteryCode = assignment.batteryCode.value,
            assignedByName = userEntity.name,
            assignedById = assignment.assignedByUserId,
            status = assignment.status,
            assignedAt = assignment.assignedAt,
            completedAt = assignment.completedAt,
            revokedAt = assignment.revokedAt
        )
        
        return ResponseEntity.status(HttpStatus.CREATED).body(dto)
    }

    @PostMapping("/assignments/{id}/revoke")
    fun revokeAssignment(
        @CurrentUser currentUser: User?,
        @PathVariable id: Long
    ): ResponseEntity<Void> {
        val user = currentUser ?: throw com.medicalsystem.backend.exception.ForbiddenException("Authorized user not found")
        assessmentAssignmentService.revokeAssignment(id, user.id)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/assignments/student/{studentId}")
    fun getStudentAssignments(
        @PathVariable studentId: Long,
        pageable: Pageable
    ): ResponseEntity<Page<AssessmentAssignmentHistoryDto>> {
        val page = assessmentAssignmentRepository.findByStudentIdOrderByAssignedAtDesc(studentId, pageable)
        val userIds = page.content.map { it.assignedByUserId }.toSet()
        val users = userRepository.findAllById(userIds).associateBy { it.id }

        val dtos = page.map { assignment ->
            val userEntity = users[assignment.assignedByUserId]
            AssessmentAssignmentHistoryDto(
                id = assignment.id!!,
                batteryCode = assignment.batteryCode.value,
                assignedByName = userEntity?.name ?: "Unknown",
                assignedById = assignment.assignedByUserId,
                status = assignment.status,
                assignedAt = assignment.assignedAt,
                completedAt = assignment.completedAt,
                revokedAt = assignment.revokedAt
            )
        }
        return ResponseEntity.ok(dtos)
    }
}
