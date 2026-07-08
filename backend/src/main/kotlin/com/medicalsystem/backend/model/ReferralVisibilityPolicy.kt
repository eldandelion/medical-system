package com.medicalsystem.backend.model

sealed class VisibilityCriteria {
    data class ByInitiator(val initiatorId: Long) : VisibilityCriteria()
    data class ByAssignedDoctor(val doctorId: Long) : VisibilityCriteria()
    data class ByStatuses(val statuses: List<ReferralStatus>) : VisibilityCriteria()
    data class InitiatedOrStatuses(val initiatorId: Long, val statuses: List<ReferralStatus>) : VisibilityCriteria()
    object All : VisibilityCriteria()
}

object ReferralVisibilityPolicy {
    fun getVisibilityCriteria(user: User): VisibilityCriteria {
        return when (user.role) {
            UserRole.TEACHER -> VisibilityCriteria.ByInitiator(user.id)
            UserRole.DOCTOR -> VisibilityCriteria.ByAssignedDoctor(user.id)
            UserRole.TRIAL_ADMIN -> VisibilityCriteria.ByStatuses(
                listOf(
                    ReferralStatus.AWAITING_TRIAGE,
                    ReferralStatus.WAITING_FOR_SCHEDULING,
                    ReferralStatus.WAITING_FOR_APPOINTMENT,
                    ReferralStatus.AWAITING_FEEDBACK_APPROVAL,
                    ReferralStatus.CLOSED
                )
            )
            UserRole.HEAD_COUNSELLOR -> VisibilityCriteria.InitiatedOrStatuses(
                initiatorId = user.id,
                statuses = listOf(
                    ReferralStatus.AWAITING_APPROVAL,
                    ReferralStatus.AWAITING_TRIAGE,
                    ReferralStatus.WAITING_FOR_SCHEDULING,
                    ReferralStatus.WAITING_FOR_APPOINTMENT,
                    ReferralStatus.AWAITING_FEEDBACK_APPROVAL,
                    ReferralStatus.CLOSED,
                    ReferralStatus.REJECTED
                )
            )
            else -> VisibilityCriteria.All
        }
    }
}
