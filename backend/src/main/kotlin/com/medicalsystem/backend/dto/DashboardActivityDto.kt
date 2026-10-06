package com.medicalsystem.backend.dto

import java.time.Instant

enum class ActivityType {
    REFERRAL_PENDING_TRIAGE,
    REFERRAL_PENDING_SCHEDULING,
    REFERRAL_PENDING_FEEDBACK,
    ASSESSMENT_PENDING_COMPLETION,
    ASSESSMENT_RECENTLY_COMPLETED,
    USER_APPROVAL_PENDING,
    UNREAD_NOTIFICATION
}

data class DashboardActivityDto(
    val id: String,
    val type: ActivityType,
    val timestamp: Instant,
    val referenceId: Long,
    val referenceName: String? = null
)

data class DashboardActivityFeedDto(
    val activities: List<DashboardActivityDto>
)
