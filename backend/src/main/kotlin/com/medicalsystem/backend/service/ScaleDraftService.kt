package com.medicalsystem.backend.service

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.databind.ObjectMapper
import com.medicalsystem.backend.config.AssessmentCatalogLoader
import com.medicalsystem.backend.dto.SaveDraftRequest
import com.medicalsystem.backend.dto.ScaleDraftDto
import com.medicalsystem.backend.entity.ScaleDraftEntity
import com.medicalsystem.backend.model.AssessmentStatus
import com.medicalsystem.backend.repository.AssessmentAssignmentJpaRepository
import com.medicalsystem.backend.repository.ScaleDraftJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class ScaleDraftService(
    private val scaleDraftJpaRepository: ScaleDraftJpaRepository,
    private val assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository,
    private val catalogLoader: AssessmentCatalogLoader,
    private val objectMapper: ObjectMapper = ObjectMapper()
) {

    @Transactional
    fun saveDraft(studentId: Long, scaleCode: String, request: SaveDraftRequest) {
        val completed = assessmentAssignmentJpaRepository.findByStudentId(studentId)
            .any { it.batteryCode == scaleCode && it.status == AssessmentStatus.COMPLETED }
        if (completed) {
            return
        }

        val answersJson = objectMapper.writeValueAsString(request.answers)
        val existingOpt = scaleDraftJpaRepository.findByStudentIdAndScaleCode(studentId, scaleCode)

        if (existingOpt.isPresent) {
            val existing = existingOpt.get()
            if (request.updatedAt >= existing.clientUpdatedAt) {
                existing.answersJson = answersJson
                existing.clientUpdatedAt = request.updatedAt
                existing.updatedAt = LocalDateTime.now()
                scaleDraftJpaRepository.save(existing)
            }
        } else {
            scaleDraftJpaRepository.save(
                ScaleDraftEntity(
                    studentId = studentId,
                    scaleCode = scaleCode,
                    answersJson = answersJson,
                    clientUpdatedAt = request.updatedAt,
                    updatedAt = LocalDateTime.now()
                )
            )
        }

        // Update answersJson on pending assignment for real-time progress tracking
        val pendingAssignments = assessmentAssignmentJpaRepository.findByStudentIdAndStatus(studentId, AssessmentStatus.PENDING)
        val assignment = pendingAssignments.firstOrNull { it.batteryCode == scaleCode }
            ?: pendingAssignments.firstOrNull()
        if (assignment != null) {
            assignment.answersJson = answersJson
            assessmentAssignmentJpaRepository.save(assignment)
        }
    }

    @Transactional(readOnly = true)
    fun getDraft(studentId: Long, scaleCode: String): ScaleDraftDto? {
        val draftOpt = scaleDraftJpaRepository.findByStudentIdAndScaleCode(studentId, scaleCode)
        if (draftOpt.isPresent) {
            val draft = draftOpt.get()
            val answers: Map<String, Any> = try {
                objectMapper.readValue(draft.answersJson, object : TypeReference<Map<String, Any>>() {})
            } catch (_: Exception) {
                emptyMap()
            }

            return ScaleDraftDto(
                scaleCode = draft.scaleCode,
                answers = answers,
                updatedAt = draft.clientUpdatedAt
            )
        }

        // Fallback to pending assignment answersJson for cross-portal draft synchronization
        val pendingAssignment = assessmentAssignmentJpaRepository
            .findByStudentIdAndStatus(studentId, AssessmentStatus.PENDING)
            .firstOrNull { it.batteryCode == scaleCode && !it.answersJson.isNullOrBlank() }
            ?: return null

        val fallbackAnswers: Map<String, Any> = try {
            objectMapper.readValue(pendingAssignment.answersJson!!, object : TypeReference<Map<String, Any>>() {})
        } catch (_: Exception) {
            emptyMap()
        }

        if (fallbackAnswers.isEmpty()) {
            return null
        }

        return ScaleDraftDto(
            scaleCode = scaleCode,
            answers = fallbackAnswers,
            updatedAt = 0L
        )
    }

    @Transactional
    fun purgeDraft(studentId: Long, scaleCode: String) {
        scaleDraftJpaRepository.deleteByStudentIdAndScaleCode(studentId, scaleCode)
    }
}
