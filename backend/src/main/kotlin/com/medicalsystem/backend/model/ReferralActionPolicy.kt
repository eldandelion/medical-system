package com.medicalsystem.backend.model

object ReferralActionPolicy {
    fun getActionableStatusesFor(role: UserRole): List<ReferralStatus> = when (role) {
        UserRole.HEAD_COUNSELLOR -> listOf(
            ReferralStatus.AWAITING_APPROVAL,
            ReferralStatus.AWAITING_FEEDBACK_APPROVAL
        )
        UserRole.TRIAL_ADMIN -> listOf(
            ReferralStatus.AWAITING_TRIAGE,
            ReferralStatus.NEEDS_REASSIGNMENT
        )
        UserRole.DOCTOR -> listOf(
            ReferralStatus.WAITING_FOR_SCHEDULING,
            ReferralStatus.WAITING_FOR_APPOINTMENT
        )
        else -> emptyList()
    }
}
