package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.repository.NotificationRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

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

    fun getNotificationsForUser(userId: Long): List<Notification> {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
    }

    @Transactional
    fun markAsRead(notificationId: Long, userId: Long) {
        val notification = notificationRepository.findById(notificationId) 
            ?: throw IllegalArgumentException("Notification not found")
        
        if (notification.userId != userId) {
            throw SecurityException("Unauthorized access to notification")
        }
        
        notification.markAsRead()
        notificationRepository.save(notification)
    }
}
