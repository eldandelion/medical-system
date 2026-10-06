package com.medicalsystem.backend.dto

import java.time.Instant

enum class ActivityType {
    REFERRAL_PENDING_TRIAGE,
    REFERRAL_PENDING_SCHEDULING,
    REFERRAL_PENDING_FEEDBACK,
    REFERRAL_STATUS_UPDATED,
    
    ASSESSMENT_PENDING_COMPLETION,
    HIGH_RISK_ASSESSMENT_SUBMITTED,
    
    USER_APPROVAL_PENDING,
    
    UNREAD_NOTIFICATION,
    SYSTEM_NOTIFICATION,
    HOSPITAL_CAPACITY_ALERT
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
