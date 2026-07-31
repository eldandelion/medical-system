package com.medicalsystem.backend.policy

import com.medicalsystem.backend.event.ReferralInitiatedEvent
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.model.RiskStatus
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.time.LocalDateTime

class ReferralNotificationRoutingPolicyTest {

    private val studentRepository: com.medicalsystem.backend.repository.StudentRepository = org.mockito.kotlin.mock()
    private val referralRepository: com.medicalsystem.backend.repository.ReferralRepository = org.mockito.kotlin.mock()
    private val userRepository: com.medicalsystem.backend.repository.UserRepository = org.mockito.kotlin.mock()
    private val policy = ReferralNotificationRoutingPolicy(studentRepository, referralRepository, userRepository)

    @org.junit.jupiter.api.BeforeEach
    fun setup() {
        val mockStudent = org.mockito.kotlin.mock<com.medicalsystem.backend.model.Student>()
        org.mockito.kotlin.whenever(mockStudent.name).thenReturn("John Doe")
        org.mockito.kotlin.whenever(studentRepository.findById(org.mockito.kotlin.any())).thenReturn(java.util.Optional.of(mockStudent))
        
        val mockReferral = org.mockito.kotlin.mock<com.medicalsystem.backend.model.Referral>()
        org.mockito.kotlin.whenever(mockReferral.riskLevel).thenReturn(RiskStatus.HIGH)
        org.mockito.kotlin.whenever(referralRepository.findById(org.mockito.kotlin.any())).thenReturn(java.util.Optional.of(mockReferral))

        val mockUser = org.mockito.kotlin.mock<com.medicalsystem.backend.model.User>()
        org.mockito.kotlin.whenever(mockUser.name).thenReturn("Jane Smith")
        org.mockito.kotlin.whenever(userRepository.findById(org.mockito.kotlin.any())).thenReturn(java.util.Optional.of(mockUser))
    }

    @Test
    fun `when teacher initiates and HC exists, returns 3 notifications`() {
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = 200L
        )
        val hcId = 300L

        val notifications = policy.determineNotifications(event, hcId)

        assertEquals(3, notifications.size)
        
        // Student notification
        val studentNotif = notifications.find { it.userId == 100L }
        requireNotNull(studentNotif)
        assertEquals(NotificationMessageCode.REFERRAL_SUBMITTED_STUDENT, studentNotif.messageCode)
        assertEquals(NotificationActionType.VIEW_RECORDS, studentNotif.actionType)
        assertEquals(mapOf("initiatorName" to "Jane Smith"), studentNotif.payload)

        // Initiator notification
        val initiatorNotif = notifications.find { it.userId == 200L }
        requireNotNull(initiatorNotif)
        assertEquals(NotificationMessageCode.REFERRAL_SUBMITTED_INITIATOR, initiatorNotif.messageCode)
        assertEquals(NotificationActionType.VIEW_REFERRAL, initiatorNotif.actionType)
        assertEquals(mapOf("studentName" to "John Doe", "riskLevel" to "HIGH", "referralId" to 1L), initiatorNotif.payload)

        // HC notification
        val hcNotif = notifications.find { it.userId == 300L }
        requireNotNull(hcNotif)
        assertEquals(NotificationMessageCode.REFERRAL_REQUIRES_REVIEW_HC, hcNotif.messageCode)
        assertEquals(NotificationActionType.REVIEW_REFERRAL, hcNotif.actionType)
        assertEquals(mapOf("studentName" to "John Doe", "riskLevel" to "HIGH", "referralId" to 1L), hcNotif.payload)
    }

    @Test
    fun `when HC initiates, returns 2 notifications (deduplicated)`() {
        val hcId = 300L
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = hcId
        )

        val notifications = policy.determineNotifications(event, hcId)

        assertEquals(2, notifications.size)

        val studentNotif = notifications.find { it.userId == 100L }
        requireNotNull(studentNotif)
        assertEquals(mapOf("initiatorName" to "Jane Smith"), studentNotif.payload)

        val hcNotif = notifications.find { it.userId == hcId }
        requireNotNull(hcNotif)
        assertEquals(NotificationMessageCode.REFERRAL_REQUIRES_REVIEW_HC, hcNotif.messageCode)
        assertEquals(NotificationActionType.REVIEW_REFERRAL, hcNotif.actionType)
        assertEquals(mapOf("studentName" to "John Doe", "riskLevel" to "HIGH", "referralId" to 1L), hcNotif.payload)
    }

    @Test
    fun `when no HC exists, falls back to 2 notifications (student and initiator)`() {
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = 200L
        )

        val notifications = policy.determineNotifications(event, null)

        assertEquals(2, notifications.size)
        assertTrue(notifications.any { it.userId == 100L })
        assertTrue(notifications.any { it.userId == 200L })
    }
}
