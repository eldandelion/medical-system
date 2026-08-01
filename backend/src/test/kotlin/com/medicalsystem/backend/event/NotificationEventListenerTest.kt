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
    private lateinit var studentRepository: com.medicalsystem.backend.repository.StudentRepository
    private lateinit var referralRepository: com.medicalsystem.backend.repository.ReferralRepository
    private lateinit var routingPolicy: NotificationRoutingPolicy<ReferralInitiatedEvent>
    private lateinit var lifecycleRoutingPolicy: com.medicalsystem.backend.policy.LifecycleNotificationRoutingPolicy
    private lateinit var listener: NotificationEventListener

    @BeforeEach
    fun setup() {
        notificationService = mock()
        headCounsellorRepository = mock()
        studentRepository = mock()
        referralRepository = mock()
        routingPolicy = mock()
        lifecycleRoutingPolicy = mock()
        listener = NotificationEventListener(
            notificationService,
            headCounsellorRepository,
            studentRepository,
            referralRepository,
            routingPolicy,
            lifecycleRoutingPolicy
        )
    }

    @Test
    fun `handleReferralInitiated delegates to routing policy and saves all notifications`() {
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = 200L
        )
        
        val mockStudent = mock<com.medicalsystem.backend.model.Student>()
        val mockDemographics = mock<com.medicalsystem.backend.model.Demographics>()
        val mockSchool = mock<com.medicalsystem.backend.model.School>()
        whenever(mockSchool.id).thenReturn(10L)
        whenever(mockDemographics.school).thenReturn(mockSchool)
        whenever(mockStudent.demographics).thenReturn(mockDemographics)
        
        whenever(studentRepository.findById(100L)).thenReturn(Optional.of(mockStudent))
        
        val hcId = 300L
        val hc = HeadCounsellor(hcId, SchoolEmployeeId("T-12345"), 10L, 5L)
        whenever(headCounsellorRepository.findBySchoolId(10L)).thenReturn(Optional.of(hc))

        val mockNotifications = listOf(
            Notification.createForStudent(100L, "HIGH"),
            Notification.createForInitiator(200L, "John Doe", "HIGH", 1L)
        )
        whenever(routingPolicy.determineNotifications(event, hcId)).thenReturn(mockNotifications)

        listener.handleReferralInitiated(event)

        verify(studentRepository).findById(100L)
        verify(headCounsellorRepository).findBySchoolId(10L)
        verify(routingPolicy).determineNotifications(event, hcId)
        verify(notificationService).saveNotification(mockNotifications[0])
        verify(notificationService).saveNotification(mockNotifications[1])
    }
}
