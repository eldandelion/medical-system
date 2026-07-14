package com.medicalsystem.backend.model

import java.time.LocalDateTime

object ReferralFactory {
    fun createDraft(
        studentId: Long,
        title: String,
        reason: String,
        riskLevel: RiskStatus,
        referredById: Long,
        clinicalStatus: List<ClinicalStatusType> = emptyList(),
        severeRiskFactors: List<RiskFlagName> = emptyList(),
        attachments: List<ReferralAttachment> = emptyList()
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
            attachments = attachments.toMutableList(),
            steps = mutableListOf(
                ReferralStep(
                    id = null,
                    type = ReferralStepType.INITIATION,
                    time = LocalDateTime.now(),
                    status = ReferralStepStatus.ACTIVE,
                    actorId = referredById
                )
            )
        )

        return referral
    }
}
