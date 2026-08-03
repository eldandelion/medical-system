package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class ReferralActionPolicyTest {

    @Test
    fun `getActionableStatusesFor returns correct statuses for Head Counsellor`() {
        val statuses = ReferralActionPolicy.getActionableStatusesFor(UserRole.HEAD_COUNSELLOR)
        assertEquals(2, statuses.size)
        assertTrue(statuses.contains(ReferralStatus.AWAITING_APPROVAL))
        assertTrue(statuses.contains(ReferralStatus.AWAITING_FEEDBACK_APPROVAL))
    }

    @Test
    fun `getActionableStatusesFor returns correct statuses for Trial Admin`() {
        val statuses = ReferralActionPolicy.getActionableStatusesFor(UserRole.TRIAL_ADMIN)
        assertEquals(2, statuses.size)
        assertTrue(statuses.contains(ReferralStatus.AWAITING_TRIAGE))
        assertTrue(statuses.contains(ReferralStatus.WAITING_FOR_SCHEDULING))
    }

    @Test
    fun `getActionableStatusesFor returns correct statuses for Doctor`() {
        val statuses = ReferralActionPolicy.getActionableStatusesFor(UserRole.DOCTOR)
        assertEquals(1, statuses.size)
        assertTrue(statuses.contains(ReferralStatus.WAITING_FOR_APPOINTMENT))
    }

    @Test
    fun `getActionableStatusesFor returns empty list for Student and Teacher`() {
        assertTrue(ReferralActionPolicy.getActionableStatusesFor(UserRole.STUDENT).isEmpty())
        assertTrue(ReferralActionPolicy.getActionableStatusesFor(UserRole.TEACHER).isEmpty())
    }
}
