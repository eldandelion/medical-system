package com.medicalsystem.backend.model

import com.medicalsystem.backend.event.AssessmentAssignedEvent
import com.medicalsystem.backend.event.AssessmentCompletedEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import java.time.LocalDate
import java.time.LocalDateTime

data class AssessmentAssignment(
    val id: Long? = null,
    val studentId: Long,
    val assignedByUserId: Long,
    val batteryCode: BatteryId,
    var status: AssessmentStatus = AssessmentStatus.PENDING,
    val assignedAt: LocalDateTime = LocalDateTime.now(),
    var completedAt: LocalDateTime? = null,
    val dueDate: LocalDate? = null,
    var answers: Map<String, Int>? = null
) : AggregateRoot() {

    fun initAssignedEvent() {
        if (this.id != null) {
            registerEvent(
                AssessmentAssignedEvent(
                    assignmentId = this.id,
                    studentId = this.studentId,
                    assignedByUserId = this.assignedByUserId,
                    batteryCode = this.batteryCode.value
                )
            )
        }
    }

    fun complete(
        responses: Map<String, Int>,
        completedTests: List<PsychometricTest>
    ) {
        if (status == AssessmentStatus.COMPLETED) {
            throw ConflictException("问卷测评已完成，不可重复提交")
        }
        if (status == AssessmentStatus.EXPIRED) {
            throw ValidationException("问卷测评已过期，无法提交")
        }

        this.answers = responses
        this.status = AssessmentStatus.COMPLETED
        this.completedAt = LocalDateTime.now()

        registerEvent(
            AssessmentCompletedEvent(
                assignmentId = this.id ?: 0L,
                studentId = this.studentId,
                batteryCode = this.batteryCode.value,
                completedTests = completedTests,
                completedAt = this.completedAt!!
            )
        )
    }

    fun isExpired(currentDate: LocalDate = LocalDate.now()): Boolean {
        return dueDate != null && currentDate.isAfter(dueDate) && status == AssessmentStatus.PENDING
    }
}
