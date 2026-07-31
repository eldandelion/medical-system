package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.repository.NotificationRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.ArgumentCaptor
import org.mockito.Mockito.*

class NotificationServiceTest {

    private lateinit var notificationRepository: NotificationRepository
    private lateinit var notificationService: NotificationService

    @BeforeEach
    fun setUp() {
        notificationRepository = mock(NotificationRepository::class.java)
        notificationService = NotificationService(notificationRepository)
    }

    @Test
    fun `should create notification and save to repository`() {
        val userId = 100L
        val messageCode = NotificationMessageCode.REFERRAL_INITIATED
        val payload = mapOf("studentId" to "456", "riskLevel" to "HIGH")
        val actionType = NotificationActionType.VIEW_REFERRAL
        val actionTargetId = 100L

        notificationService.createNotification(userId, messageCode, payload, actionType, actionTargetId)

        val captor = ArgumentCaptor.forClass(Notification::class.java)
        verify(notificationRepository).save(captor.capture() ?: Notification(userId = 0, messageCode = NotificationMessageCode.REFERRAL_INITIATED, payload = emptyMap()))

        val savedEntity = captor.value
        assertEquals(userId, savedEntity.userId)
        assertEquals(messageCode, savedEntity.messageCode)
        assertEquals(payload, savedEntity.payload)
        assertEquals(actionType, savedEntity.actionType)
        assertEquals(actionTargetId, savedEntity.actionTargetId)
        assertFalse(savedEntity.isRead)
        assertTrue(savedEntity.isActionAvailable)
    }

    @Test
    fun `should invalidate actions for target`() {
        val actionType = NotificationActionType.REVIEW_REFERRAL
        val targetId = 123L

        notificationService.invalidateActions(actionType, targetId)

        verify(notificationRepository).invalidateActionsForTarget(actionType, targetId)
    }

    @Test
    fun `getNotificationsForUser returns notifications sorted by creation date`() {
        val userId = 1L
        val notifications = listOf(
            Notification(id = 1, userId = userId, messageCode = NotificationMessageCode.REFERRAL_SUBMITTED_STUDENT, actionType = NotificationActionType.NONE, payload = emptyMap(), isRead = false),
            Notification(id = 2, userId = userId, messageCode = NotificationMessageCode.REFERRAL_REQUIRES_REVIEW_HC, actionType = NotificationActionType.REVIEW_REFERRAL, payload = emptyMap(), isRead = false)
        )
        `when`(notificationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(notifications.reversed())
        
        val result = notificationService.getNotificationsForUser(userId)
        
        assertEquals(2, result.size)
        assertEquals(2L, result[0].id) // Newest first
    }

    @Test
    fun `markAsRead successfully updates notification state`() {
        val userId = 123L
        val notificationId = 1L
        val notification = Notification(id = notificationId, userId = userId, messageCode = NotificationMessageCode.REFERRAL_SUBMITTED_STUDENT, actionType = NotificationActionType.NONE, payload = emptyMap(), isRead = false)
        
        `when`(notificationRepository.findById(notificationId)).thenReturn(notification)
        
        notificationService.markAsRead(notificationId, userId)
        
        verify(notificationRepository).save(notification)
        assertTrue(notification.isRead)
    }
}
