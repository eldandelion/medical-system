package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.HeadCounsellor
import com.medicalsystem.backend.model.SchoolEmployeeId
import com.medicalsystem.backend.policy.NotificationRoutingPolicy
import com.medicalsystem.backend.repository.HeadCounsellorRepository
import com.medicalsystem.backend.service.NotificationService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.kotlin.any
import org.mockito.kotlin.mock
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional

class NotificationEventListenerTest {

    private lateinit var notificationService: NotificationService
    private lateinit var headCounsellorRepository: HeadCounsellorRepository
    private lateinit var routingPolicy: NotificationRoutingPolicy<ReferralInitiatedEvent>
    private lateinit var listener: NotificationEventListener

    @BeforeEach
    fun setup() {
        notificationService = mock()
        headCounsellorRepository = mock()
        routingPolicy = mock()
        listener = NotificationEventListener(notificationService, headCounsellorRepository, routingPolicy)
    }

    @Test
    fun `handleReferralInitiated delegates to routing policy and saves all notifications`() {
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = 200L,
            schoolId = 10L,
            riskStatus = RiskStatus.HIGH
        )
        val hcId = 300L
        val hc = HeadCounsellor(hcId, SchoolEmployeeId("T-12345"), 10L, 5L)
        whenever(headCounsellorRepository.findBySchoolId(10L)).thenReturn(Optional.of(hc))

        val mockNotifications = listOf(
            Notification.createForStudent(100L, "HIGH"),
            Notification.createForInitiator(200L, 100L, "HIGH", 1L)
        )
        whenever(routingPolicy.determineNotifications(event, hcId)).thenReturn(mockNotifications)

        listener.handleReferralInitiated(event)

        verify(headCounsellorRepository).findBySchoolId(10L)
        verify(routingPolicy).determineNotifications(event, hcId)
        verify(notificationService).saveNotification(mockNotifications[0])
        verify(notificationService).saveNotification(mockNotifications[1])
    }
}
