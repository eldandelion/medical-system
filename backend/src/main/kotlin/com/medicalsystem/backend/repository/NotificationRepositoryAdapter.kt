package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.NotificationEntity
import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import org.springframework.stereotype.Repository
import com.fasterxml.jackson.databind.ObjectMapper

@Repository
class NotificationRepositoryAdapter(
    private val notificationJpaRepository: NotificationJpaRepository
) : NotificationRepository {

    private val objectMapper = ObjectMapper()

    override fun save(notification: Notification): Notification {
        val entity = NotificationEntity(
            id = notification.id ?: 0L,
            userId = notification.userId,
            messageCode = notification.messageCode,
            messageArgs = objectMapper.writeValueAsString(notification.messageArgs),
            isRead = notification.isRead,
            createdAt = notification.createdAt,
            actionType = notification.actionType,
            actionTargetId = notification.actionTargetId,
            isActionAvailable = notification.isActionAvailable
        )
        val savedEntity = notificationJpaRepository.save(entity)
        return toDomain(savedEntity)
    }

    override fun findAllByUserId(userId: Long): List<Notification> {
        return notificationJpaRepository.findAllByUserIdOrderByCreatedAtDesc(userId).map { toDomain(it) }
    }

    override fun invalidateActionsForTarget(actionType: NotificationActionType, targetId: Long) {
        notificationJpaRepository.invalidateActionsForTarget(actionType, targetId)
    }

    private fun toDomain(entity: NotificationEntity): Notification {
        val args: List<String> = try {
            objectMapper.readValue(entity.messageArgs, objectMapper.typeFactory.constructCollectionType(List::class.java, String::class.java))
        } catch (e: Exception) {
            emptyList()
        }
        
        return Notification(
            id = entity.id,
            userId = entity.userId,
            messageCode = entity.messageCode,
            messageArgs = args,
            isRead = entity.isRead,
            createdAt = entity.createdAt,
            actionType = entity.actionType,
            actionTargetId = entity.actionTargetId,
            isActionAvailable = entity.isActionAvailable
        )
    }
}
