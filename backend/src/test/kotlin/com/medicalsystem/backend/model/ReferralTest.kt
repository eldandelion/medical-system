package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

class ReferralTest {

    @Test
    fun `initiate adds INITIATION step for draft`() {
        val referral = ReferralFactory.initiate(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L,
            isDraft = true
        )

        assertEquals(ReferralStatus.DRAFT, referral.status)
        assertEquals(1, referral.steps.size)
        val step = referral.steps[0]
        assertEquals(ReferralStepType.INITIATION, step.type)
        assertEquals(ReferralStepStatus.ACTIVE, step.status)
        assertEquals(2L, step.actorId)
    }

    @Test
    fun `initiate transitions to AWAITING_APPROVAL and adds REVIEW step for non-draft`() {
        val referral = ReferralFactory.initiate(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L,
            isDraft = false
        )

        assertEquals(ReferralStatus.AWAITING_APPROVAL, referral.status)
        assertEquals(2, referral.steps.size)
        
        val step1 = referral.steps[0]
        assertEquals(ReferralStepType.INITIATION, step1.type)
        assertEquals(ReferralStepStatus.COMPLETED, step1.status)
        
        val step2 = referral.steps[1]
        assertEquals(ReferralStepType.REVIEW, step2.type)
        assertEquals(ReferralStepStatus.ACTIVE, step2.status)
    }

    @Test
    fun `transition marks previous active step as completed and adds new step`() {
        val referral = ReferralFactory.initiate(
            studentId = 1L,
            title = "Test",
            reason = "Test reason",
            riskLevel = RiskStatus.LOW,
            referredById = 2L,
            isDraft = false
        )

        referral.transition(ReferralStatus.AWAITING_TRIAGE)

        assertEquals(ReferralStatus.AWAITING_TRIAGE, referral.status)
        assertEquals(3, referral.steps.size)
        
        assertEquals(ReferralStepStatus.COMPLETED, referral.steps[0].status)
        assertEquals(ReferralStepStatus.COMPLETED, referral.steps[1].status)
        
        val step3 = referral.steps[2]
        assertEquals(ReferralStepType.TRIAGE, step3.type)
        assertEquals(ReferralStepStatus.ACTIVE, step3.status)
    }
}
