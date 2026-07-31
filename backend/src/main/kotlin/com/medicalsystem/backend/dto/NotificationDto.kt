package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import java.time.LocalDateTime

data class NotificationDto(
    val id: Long,
    val userId: Long,
    val messageCode: String,
    val payload: Map<String, Any>,
    val isRead: Boolean,
    val createdAt: LocalDateTime,
    val actionType: String,
    val actionTargetId: Long?,
    val isActionAvailable: Boolean
)
