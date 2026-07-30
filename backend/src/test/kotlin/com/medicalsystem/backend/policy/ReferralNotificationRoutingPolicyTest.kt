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

    private val policy = ReferralNotificationRoutingPolicy()

    @Test
    fun `when teacher initiates and HC exists, returns 3 notifications`() {
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = 200L,
            schoolId = 10L,
            riskStatus = RiskStatus.HIGH
        )
        val hcId = 300L

        val notifications = policy.determineNotifications(event, hcId)

        assertEquals(3, notifications.size)
        
        // Student notification
        val studentNotif = notifications.find { it.userId == 100L }
        requireNotNull(studentNotif)
        assertEquals(NotificationMessageCode.REFERRAL_SUBMITTED_STUDENT, studentNotif.messageCode)
        assertEquals(NotificationActionType.NONE, studentNotif.actionType)

        // Initiator notification
        val initiatorNotif = notifications.find { it.userId == 200L }
        requireNotNull(initiatorNotif)
        assertEquals(NotificationMessageCode.REFERRAL_SUBMITTED_INITIATOR, initiatorNotif.messageCode)
        assertEquals(NotificationActionType.VIEW_REFERRAL, initiatorNotif.actionType)

        // HC notification
        val hcNotif = notifications.find { it.userId == 300L }
        requireNotNull(hcNotif)
        assertEquals(NotificationMessageCode.REFERRAL_REQUIRES_REVIEW_HC, hcNotif.messageCode)
        assertEquals(NotificationActionType.REVIEW_REFERRAL, hcNotif.actionType)
    }

    @Test
    fun `when HC initiates, returns 2 notifications (deduplicated)`() {
        val hcId = 300L
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = hcId,
            schoolId = 10L,
            riskStatus = RiskStatus.MEDIUM
        )

        val notifications = policy.determineNotifications(event, hcId)

        assertEquals(2, notifications.size)

        val studentNotif = notifications.find { it.userId == 100L }
        requireNotNull(studentNotif)

        val hcNotif = notifications.find { it.userId == hcId }
        requireNotNull(hcNotif)
        assertEquals(NotificationMessageCode.REFERRAL_REQUIRES_REVIEW_HC, hcNotif.messageCode)
        assertEquals(NotificationActionType.REVIEW_REFERRAL, hcNotif.actionType)
    }

    @Test
    fun `when no HC exists, falls back to 2 notifications (student and initiator)`() {
        val event = ReferralInitiatedEvent(
            referralId = 1L,
            studentId = 100L,
            initiatorId = 200L,
            schoolId = 10L,
            riskStatus = RiskStatus.LOW
        )

        val notifications = policy.determineNotifications(event, null)

        assertEquals(2, notifications.size)
        assertTrue(notifications.any { it.userId == 100L })
        assertTrue(notifications.any { it.userId == 200L })
    }
}
