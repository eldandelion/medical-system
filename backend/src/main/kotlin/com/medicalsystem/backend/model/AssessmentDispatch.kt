package com.medicalsystem.backend.model

import java.time.LocalDate
import java.time.LocalDateTime

data class AssessmentDispatch(
    val id: Long? = null,
    val batteryCode: BatteryId,
    val dispatchedByUserId: Long,
    val dispatchType: DispatchType,
    val targetCohort: String? = null,
    val dispatchedAt: LocalDateTime = LocalDateTime.now(),
    val dueDate: LocalDate? = null,
    var status: DispatchStatus = DispatchStatus.ACTIVE
) : AggregateRoot() {

    fun initDispatchedEvent(studentIds: List<Long>) {
        // Event registration is omitted since AssessmentDispatchedEvent is not defined in the scope of writable files
    }

    fun revoke(revokerId: Long) {
        if (this.dispatchedByUserId != revokerId) {
            throw com.medicalsystem.backend.exception.ForbiddenException("Only the original dispatcher can revoke this dispatch batch")
        }
        this.status = DispatchStatus.REVOKED
    }

    companion object {
        fun createBatch(
            batteryCode: BatteryId,
            dispatcherId: Long,
            targetCohort: String,
            dueDate: LocalDate? = null
        ): AssessmentDispatch {
            return AssessmentDispatch(
                batteryCode = batteryCode,
                dispatchedByUserId = dispatcherId,
                dispatchType = DispatchType.ROUTINE_SCREENING,
                targetCohort = targetCohort,
                dueDate = dueDate
            )
        }

        fun createForIndividuals(
            batteryCode: BatteryId,
            dispatcherId: Long,
            dueDate: LocalDate? = null
        ): AssessmentDispatch {
            return AssessmentDispatch(
                batteryCode = batteryCode,
                dispatchedByUserId = dispatcherId,
                dispatchType = DispatchType.ON_DEMAND,
                targetCohort = null,
                dueDate = dueDate
            )
        }
    }
}

enum class DispatchType {
    ROUTINE_SCREENING,
    ON_DEMAND,
    CLINICAL_TRIAL,
    FOLLOW_UP
}

enum class DispatchStatus {
    ACTIVE,
    REVOKED,
    COMPLETED
}
