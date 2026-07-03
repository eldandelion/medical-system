package com.medicalsystem.backend.model

import java.time.LocalDateTime

object ReferralFactory {
    fun initiate(
        studentId: Long,
        title: String,
        reason: String,
        riskLevel: RiskStatus,
        referredById: Long,
        clinicalStatus: List<ClinicalStatusType> = emptyList(),
        severeRiskFactors: List<RiskFlagName> = emptyList(),
        attachments: List<Attachment> = emptyList(),
        isDraft: Boolean = false
    ): Referral {
        val referral = Referral(
            id = null,
            studentId = studentId,
            type = ReferralType.INITIAL,
            date = LocalDateTime.now(),
            title = title,
            description = reason,
            riskLevel = riskLevel,
            status = ReferralStatus.DRAFT,
            referredById = referredById,
            clinicalStatus = clinicalStatus.toMutableList(),
            severeRiskFactors = severeRiskFactors.toMutableList(),
            attachments = attachments.toMutableList()
        )

        if (!isDraft) {
            referral.transition(ReferralStatus.AWAITING_APPROVAL, "Referral Submitted")
        }
        return referral
    }
}
