package com.medicalsystem.backend.model

import java.time.Instant

data class ReferralFeedback(
    val id: Long = 0,
    val referralId: Long,
    val content: String,
    val attachments: List<FeedbackAttachment> = emptyList(),
    val createdAt: Instant = Instant.now()
)
