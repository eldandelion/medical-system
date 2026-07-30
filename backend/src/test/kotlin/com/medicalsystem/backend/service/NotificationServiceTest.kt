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
        val messageArgs = listOf("456", "HIGH")
        val actionType = NotificationActionType.REVIEW_REFERRAL
        val actionTargetId = 789L

        notificationService.createNotification(userId, messageCode, messageArgs, actionType, actionTargetId)

        val captor = ArgumentCaptor.forClass(Notification::class.java)
        verify(notificationRepository).save(captor.capture() ?: Notification(userId = 0, messageCode = NotificationMessageCode.REFERRAL_INITIATED, messageArgs = emptyList()))

        val savedEntity = captor.value
        assertEquals(userId, savedEntity.userId)
        assertEquals(messageCode, savedEntity.messageCode)
        assertEquals(messageArgs, savedEntity.messageArgs)
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
}
