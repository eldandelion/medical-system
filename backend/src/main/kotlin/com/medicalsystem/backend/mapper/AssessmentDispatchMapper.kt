package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.AssessmentDispatchEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.AssessmentDispatch
import com.medicalsystem.backend.model.BatteryId
import jakarta.persistence.EntityManager
import org.springframework.stereotype.Component

@Component
class AssessmentDispatchMapper(
    private val entityManager: EntityManager
) {
    fun toModel(entity: AssessmentDispatchEntity): AssessmentDispatch {
        return AssessmentDispatch(
            id = entity.id,
            batteryCode = BatteryId(entity.batteryCode),
            dispatchedByUserId = entity.dispatchedByUser.id,
            dispatchType = entity.dispatchType,
            targetCohort = entity.targetCohort,
            dispatchedAt = entity.dispatchedAt,
            dueDate = entity.dueDate,
            status = entity.status
        )
    }

    fun toEntity(model: AssessmentDispatch): AssessmentDispatchEntity {
        val dispatcherRef = entityManager.getReference(UserEntity::class.java, model.dispatchedByUserId)

        return AssessmentDispatchEntity(
            id = model.id,
            batteryCode = model.batteryCode.value,
            dispatchedByUser = dispatcherRef,
            dispatchedAt = model.dispatchedAt,
            dispatchType = model.dispatchType,
            targetCohort = model.targetCohort,
            dueDate = model.dueDate,
            status = model.status
        )
    }
}
