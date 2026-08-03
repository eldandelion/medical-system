package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType

interface NotificationRepository {
    fun save(notification: Notification): Notification
    fun saveAll(notifications: List<Notification>): List<Notification>
    fun invalidateActionsForTarget(actionType: NotificationActionType, targetId: Long)
    fun findByUserIdOrderByCreatedAtDesc(userId: Long): List<Notification>
    fun findById(id: Long): Notification?
    fun countUnreadByUserId(userId: Long): Long
}
