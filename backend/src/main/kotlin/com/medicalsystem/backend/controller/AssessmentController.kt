package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.AssessmentService
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/assessments")
class AssessmentController(
    private val assessmentService: AssessmentService
) {

    @GetMapping
    fun fetchAssessments(@CurrentUser user: User?): List<AssessmentListItemDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return assessmentService.getAssessmentsForUser(currentUser)
    }

    @GetMapping("/catalog")
    fun fetchCatalog(): List<AssessmentCatalogItemDto> {
        return assessmentService.getCatalog()
    }

    @GetMapping("/{id}")
    fun fetchAssessmentDetails(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): AssessmentDetailsDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return assessmentService.getAssessmentDetails(id, currentUser)
    }

    @PostMapping("/assign")
    @ResponseStatus(HttpStatus.CREATED)
    fun assignAssessment(
        @Valid @RequestBody request: AssignAssessmentRequest,
        @CurrentUser user: User?
    ): BatchAssignResultDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return assessmentService.assignToStudent(request, currentUser)
    }

    @PostMapping("/assign/cohort")
    @ResponseStatus(HttpStatus.CREATED)
    fun assignCohortAssessment(
        @Valid @RequestBody request: AssignCohortAssessmentRequest,
        @CurrentUser user: User?
    ): BatchAssignResultDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return assessmentService.assignToCohort(request, currentUser)
    }

    @PostMapping("/{id}/submit")
    fun submitAssessment(
        @PathVariable id: Long,
        @Valid @RequestBody request: SubmitAssessmentRequest,
        @CurrentUser user: User?
    ): AssessmentSubmissionResponseDto {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        return assessmentService.submitAssessment(id, request, currentUser)
    }
}
