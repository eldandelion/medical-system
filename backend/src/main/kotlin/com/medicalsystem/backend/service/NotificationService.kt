package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.NotificationDto
import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.repository.NotificationRepository
import com.medicalsystem.backend.repository.ReferralRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class NotificationService(
    private val notificationRepository: NotificationRepository,
    private val referralRepository: ReferralRepository
) {
    fun saveNotification(notification: Notification) {
        notificationRepository.save(notification)
    }

    fun createNotification(
        userId: Long,
        messageCode: NotificationMessageCode,
        payload: Map<String, Any>,
        actionType: NotificationActionType = NotificationActionType.NONE,
        actionTargetId: Long? = null
    ): Notification {
        val notification = Notification(
            userId = userId,
            messageCode = messageCode,
            payload = payload,
            actionType = actionType,
            actionTargetId = actionTargetId
        )
        return notificationRepository.save(notification)
    }

    fun invalidateActions(actionType: NotificationActionType, targetId: Long) {
        notificationRepository.invalidateActionsForTarget(actionType, targetId)
    }

    fun getNotificationsForUser(userId: Long): List<Notification> {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
    }

    fun getNotificationDtosForUser(userId: Long): List<NotificationDto> {
        val notifications = notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)
        val highRiskStudentIds = notifications
            .filter { it.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_HC || it.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER }
            .mapNotNull { it.actionTargetId }
            .toSet()
        val studentIdsWithOpenReferral = if (highRiskStudentIds.isNotEmpty()) {
            referralRepository.findStudentIdsWithOpenReferral(highRiskStudentIds)
        } else {
            emptySet()
        }
        return notifications.map { notif ->
            val canCreateReferral = if (notif.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_HC || notif.messageCode == NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER) {
                notif.actionTargetId?.let { studentId -> studentId !in studentIdsWithOpenReferral } ?: true
            } else {
                null
            }
            NotificationDto(
                id = notif.id!!,
                userId = notif.userId,
                messageCode = notif.messageCode.name,
                payload = notif.payload,
                isRead = notif.isRead,
                createdAt = notif.createdAt,
                actionType = notif.actionType.name,
                actionTargetId = notif.actionTargetId,
                isActionAvailable = notif.isActionAvailable,
                canCreateReferral = canCreateReferral
            )
        }
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
