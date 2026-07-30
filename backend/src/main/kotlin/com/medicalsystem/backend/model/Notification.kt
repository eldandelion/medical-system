package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class Notification(
    val id: Long? = null,
    val userId: Long,
    val messageCode: NotificationMessageCode,
    val messageArgs: List<String> = emptyList(),
    var isRead: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val actionType: NotificationActionType = NotificationActionType.NONE,
    val actionTargetId: Long? = null,
    var isActionAvailable: Boolean = true
) {
    fun markAsRead() {
        this.isRead = true
    }

    fun invalidateAction() {
        this.isActionAvailable = false
    }
}