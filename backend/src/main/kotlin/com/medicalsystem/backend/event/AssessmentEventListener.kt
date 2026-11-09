package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.service.NotificationService
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
@Transactional(propagation = Propagation.REQUIRES_NEW)
class AssessmentEventListener(
    private val notificationService: NotificationService,
    private val studentRepository: StudentRepository
) {

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleAssessmentAssigned(event: AssessmentAssignedEvent) {
        val student = studentRepository.findById(event.studentId).orElse(null) ?: return

        val notification = Notification(
            userId = student.id,
            messageCode = NotificationMessageCode.ASSESSMENT_ASSIGNED_STUDENT,
            payload = mapOf(
                "assignmentId" to event.assignmentId.toString(),
                "batteryCode" to event.batteryCode
            ),
            actionType = NotificationActionType.START_ASSESSMENT,
            actionTargetId = event.assignmentId,
            isActionAvailable = true
        )
        notificationService.saveNotification(notification)
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleAssessmentCompleted(event: AssessmentCompletedEvent) {
        val student = studentRepository.findById(event.studentId).orElse(null) ?: return

        // 1. Notify assigned teacher
        val teacherUserId = student.assignedTeacherId
        if (teacherUserId != null) {
            val teacherNotification = Notification(
                userId = teacherUserId,
                messageCode = NotificationMessageCode.ASSESSMENT_COMPLETED_TEACHER,
                payload = mapOf(
                    "studentId" to student.id.toString(),
                    "studentName" to student.name,
                    "batteryCode" to event.batteryCode
                ),
                actionType = NotificationActionType.VIEW_RECORDS,
                actionTargetId = student.id,
                isActionAvailable = true
            )
            notificationService.saveNotification(teacherNotification)
        }
    }
}
