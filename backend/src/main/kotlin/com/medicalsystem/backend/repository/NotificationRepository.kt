package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType

interface NotificationRepository {
    fun save(notification: Notification): Notification
    fun findAllByUserId(userId: Long): List<Notification>
    fun invalidateActionsForTarget(actionType: NotificationActionType, targetId: Long)
}
