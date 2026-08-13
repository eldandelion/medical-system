package com.medicalsystem.backend.service

import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.BatteryId
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class AssessmentAssignmentService(
    private val assessmentAssignmentRepository: AssessmentAssignmentRepository,
    private val domainEventPublisher: DomainEventPublisher
) {
    @Transactional
    fun assignAssessment(studentId: Long, assignedByUserId: Long, batteryCode: String): AssessmentAssignment {
        // Create the pure aggregate
        val assignment = AssessmentAssignment(
            studentId = studentId,
            assignedByUserId = assignedByUserId,
            batteryCode = BatteryId(batteryCode)
        )
        
        assignment.initAssignedEvent()
        
        try {
            val saved = assessmentAssignmentRepository.save(assignment)
            
            // Publish events registered in the aggregate
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

        saved.getDomainEvents().forEach { domainEventPublisher.publish(it) }
        saved.clearDomainEvents()

        return saved
    }
}
