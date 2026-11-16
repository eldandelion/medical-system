package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.AssessmentAssignmentHistoryDto
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.AssessmentDispatch
import com.medicalsystem.backend.model.AssessmentScaleRepository
import com.medicalsystem.backend.model.AssessmentStatus
import com.medicalsystem.backend.model.BatteryId
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository
import com.medicalsystem.backend.repository.AssessmentDispatchRepository
import com.medicalsystem.backend.repository.AssessmentScaleSettingJpaRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
class AssessmentAssignmentService(
    private val assessmentAssignmentRepository: AssessmentAssignmentRepository,
    private val domainEventPublisher: DomainEventPublisher,
    private val studentRepository: StudentRepository,
    private val dispatchRepository: AssessmentDispatchRepository,
    private val scaleRepository: AssessmentScaleRepository,
    private val scaleSettingRepository: AssessmentScaleSettingJpaRepository,
    private val userRepository: UserRepository
) {
    @Transactional(readOnly = true)
    fun getStudentAssignments(user: User, studentId: Long, pageable: Pageable): Page<AssessmentAssignmentHistoryDto> {
        if (user.role == UserRole.STUDENT) {
            if (user.id != studentId) {
                throw ForbiddenException("Students can only view their own assessment history")
            }
        } else {
            studentRepository.findByIdAndVisibleTo(studentId, user).orElseThrow {
                NotFoundException("Student with id $studentId not found or not in your visibility scope")
            }
        }

        val page = assessmentAssignmentRepository.findByStudentIdOrderByAssignedAtDesc(studentId, pageable)
        val userIds = page.content.map { it.assignedByUserId }.toSet()
        val users = userRepository.findAllById(userIds).associateBy { it.id }

        return page.map { assignment ->
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
    }
    @Transactional
    fun assignAssessment(studentId: Long, assigner: User, batteryCode: String): AssessmentAssignment {
        if (assigner.role !in listOf(UserRole.TEACHER, UserRole.HEAD_COUNSELLOR, UserRole.SYSTEM_ADMIN)) {
            throw ForbiddenException("Only educators and administrators can assign assessments")
        }

        val normalizedCode = batteryCode.trim()
        scaleRepository.findByBatteryCode(normalizedCode).orElseThrow {
            NotFoundException("Assessment scale definition not found for $normalizedCode")
        }
        val scaleSetting = scaleSettingRepository.findById(normalizedCode).orElse(null)
        if (scaleSetting?.isAvailable == false) {
            throw ValidationException("Assessment scale $normalizedCode is currently unavailable")
        }

        val student = studentRepository.findByIdAndVisibleTo(studentId, assigner).orElseThrow {
            NotFoundException("Student with id $studentId not found or not in your visibility scope")
        }

        val existingPending = assessmentAssignmentRepository
            .findByStudentIdAndStatus(student.id, AssessmentStatus.PENDING)
            .filter { it.batteryCode.value == normalizedCode }
            .maxByOrNull { it.assignedAt }

        val savedDispatch = dispatchRepository.save(
            AssessmentDispatch.createForIndividuals(
                batteryCode = BatteryId(normalizedCode),
                dispatcherId = assigner.id
            )
        )

        val assignmentToSave = if (existingPending != null) {
            // If the only pending row was auto-seeded during student self-registration,
            // upgrade it with the formal educator dispatch instead of creating duplicates or blocking first assignment.
            val isSelfSeeded = existingPending.assignedByUserId == student.id && existingPending.dispatchId == null
            if (!isSelfSeeded) {
                throw ConflictException("DUPLICATE_ASSIGNMENT")
            }
            existingPending.copy(
                assignedByUserId = assigner.id,
                dispatchId = savedDispatch.id,
                assignedAt = LocalDateTime.now()
            )
        } else {
            AssessmentAssignment(
                studentId = student.id,
                assignedByUserId = assigner.id,
                batteryCode = BatteryId(normalizedCode),
                dispatchId = savedDispatch.id
            )
        }

        try {
            val saved = assessmentAssignmentRepository.save(assignmentToSave)
            saved.initAssignedEvent()
            saved.getDomainEvents().forEach { domainEventPublisher.publish(it) }
            saved.clearDomainEvents()
            return saved
        } catch (e: DataIntegrityViolationException) {
            throw ConflictException("DUPLICATE_ASSIGNMENT")
        }
    }

    @Transactional
    fun revokeAssignment(assignmentId: Long, revokerId: Long): AssessmentAssignment {
        val assignment = assessmentAssignmentRepository.findById(assignmentId)
            .orElseThrow { NotFoundException("Assignment not found") }

        assignment.revoke(revokerId)
        val saved = assessmentAssignmentRepository.save(assignment)

        assignment.getDomainEvents().forEach { domainEventPublisher.publish(it) }
        assignment.clearDomainEvents()

        return saved
    }
}
