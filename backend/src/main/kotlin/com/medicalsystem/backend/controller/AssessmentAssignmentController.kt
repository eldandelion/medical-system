package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AssessmentAssignmentHistoryDto
import com.medicalsystem.backend.dto.AssignAssessmentRequestDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.AssessmentAssignmentService
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/assessments")
class AssessmentAssignmentController(
    private val assessmentAssignmentService: AssessmentAssignmentService,
    private val userRepository: UserRepository
) {
    @PostMapping("/assignments")
    @ResponseStatus(HttpStatus.CREATED)
    fun assignAssessment(
        @CurrentUser currentUser: User?,
        @RequestBody request: AssignAssessmentRequestDto
    ): ResponseEntity<AssessmentAssignmentHistoryDto> {
        val user = currentUser ?: throw ForbiddenException("Authorized user not found")
        val assignment = assessmentAssignmentService.assignAssessment(
            studentId = request.studentId,
            assigner = user,
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
        val user = currentUser ?: throw ForbiddenException("Authorized user not found")
        if (user.role !in listOf(UserRole.TEACHER, UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN)) {
            throw ForbiddenException("Only educators and administrators can revoke assignments")
        }
        assessmentAssignmentService.revokeAssignment(id, user.id)
        return ResponseEntity.ok().build()
    }

    @GetMapping("/assignments/student/{studentId}")
    fun getStudentAssignments(
        @CurrentUser currentUser: User?,
        @PathVariable studentId: Long,
        pageable: Pageable
    ): ResponseEntity<Page<AssessmentAssignmentHistoryDto>> {
        val user = currentUser ?: throw ForbiddenException("Authorized user not found")
        return ResponseEntity.ok(assessmentAssignmentService.getStudentAssignments(user, studentId, pageable))
    }
}
