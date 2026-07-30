package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.repository.NotificationRepository
import org.springframework.stereotype.Service

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository
) {
    fun saveNotification(notification: Notification) {
        notificationRepository.save(notification)
    }

    fun createNotification(
        userId: Long,
        messageCode: NotificationMessageCode,
        messageArgs: List<String>,
        actionType: NotificationActionType,
        actionTargetId: Long?
    ) {
        val notification = Notification(
            userId = userId,
            messageCode = messageCode,
            messageArgs = messageArgs,
            actionType = actionType,
            actionTargetId = actionTargetId,
            isRead = false,
            isActionAvailable = true
        )
        saveNotification(notification)
    }

    fun invalidateActions(actionType: NotificationActionType, targetId: Long) {
        notificationRepository.invalidateActionsForTarget(actionType, targetId)
    }
}
