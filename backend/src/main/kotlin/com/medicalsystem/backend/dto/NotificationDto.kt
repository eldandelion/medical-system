package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import java.time.LocalDateTime

data class NotificationDto(
    val id: Long,
    val userId: Long,
    val messageCode: NotificationMessageCode,
    val messageArgs: List<String>,
    val isRead: Boolean,
    val createdAt: LocalDateTime,
    val actionType: NotificationActionType,
    val actionTargetId: Long?,
    val isActionAvailable: Boolean
)
