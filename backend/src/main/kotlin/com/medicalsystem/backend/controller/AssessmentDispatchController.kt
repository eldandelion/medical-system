package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AssessmentDispatchSummaryDto
import com.medicalsystem.backend.dto.ParticipationRecordDto
import com.medicalsystem.backend.model.ResultSeverity
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
    @GetMapping("/dispatches/summary")
    fun getRecentDispatches(): ResponseEntity<List<AssessmentDispatchSummaryDto>> {
        return ResponseEntity.ok(assessmentDispatchService.getDispatchSummaries())
    }

    @GetMapping("/participation-records")
    fun getParticipationRecords(
        @RequestParam(required = false) dispatchId: Long?,
        @RequestParam(required = false) studentName: String?,
        @RequestParam(required = false) studentNumber: String?,
        @RequestParam(required = false) severity: ResultSeverity?,
        pageable: Pageable
    ): ResponseEntity<Page<ParticipationRecordDto>> {
        return ResponseEntity.ok(
            assessmentDispatchService.getParticipationRecords(dispatchId, studentName, studentNumber, severity, pageable)
        )
    }
}
