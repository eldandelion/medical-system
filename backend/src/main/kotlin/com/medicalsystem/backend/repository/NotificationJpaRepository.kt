package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.NotificationEntity
import com.medicalsystem.backend.model.NotificationActionType
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface NotificationJpaRepository : JpaRepository<NotificationEntity, Long> {
    fun findAllByUserIdOrderByCreatedAtDesc(userId: Long): List<NotificationEntity>
    
    @Modifying
    @Query("UPDATE NotificationEntity n SET n.isActionAvailable = false WHERE n.actionType = :actionType AND n.actionTargetId = :targetId")
    fun invalidateActionsForTarget(actionType: NotificationActionType, targetId: Long)
}
