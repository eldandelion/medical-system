package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class NotificationEnumsTest {

    @Test
    fun testNotificationMessageCodeTeacherHighRiskAlert() {
        val code = NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_TEACHER
        assertEquals(34, code.code)
        assertEquals(code, NotificationMessageCode.fromCode(34))

        // Codes must be unique
        val allCodes = NotificationMessageCode.entries.map { it.code }
        assertEquals(allCodes.size, allCodes.toSet().size)
    }

    @Test
    fun testNotificationActionTypeViewStudent() {
        val action = NotificationActionType.VIEW_STUDENT
        assertEquals(11, action.code)
        assertEquals(action, NotificationActionType.fromCode(11))

        // Codes must be unique
        val allCodes = NotificationActionType.entries.map { it.code }
        assertEquals(allCodes.size, allCodes.toSet().size)
    }

    @Test
    fun testReferralStatusTerminalStatuses() {
        assertEquals(
            setOf(ReferralStatus.REJECTED, ReferralStatus.CLOSED, ReferralStatus.ERROR),
            ReferralStatus.TERMINAL_STATUSES
        )

        assertTrue(ReferralStatus.REJECTED.isTerminal)
        assertTrue(ReferralStatus.CLOSED.isTerminal)
        assertTrue(ReferralStatus.ERROR.isTerminal)

        assertFalse(ReferralStatus.DRAFT.isTerminal)
        assertFalse(ReferralStatus.AWAITING_APPROVAL.isTerminal)
        assertFalse(ReferralStatus.AWAITING_TRIAGE.isTerminal)
        assertFalse(ReferralStatus.WAITING_FOR_SCHEDULING.isTerminal)
        assertFalse(ReferralStatus.WAITING_FOR_APPOINTMENT.isTerminal)
        assertFalse(ReferralStatus.AWAITING_FEEDBACK_APPROVAL.isTerminal)
        assertFalse(ReferralStatus.NEEDS_REASSIGNMENT.isTerminal)
        assertFalse(ReferralStatus.RECALLED.isTerminal)
    }
}
