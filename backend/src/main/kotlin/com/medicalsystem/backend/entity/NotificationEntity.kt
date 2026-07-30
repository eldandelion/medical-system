package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "notifications",
    indexes = [
        Index(name = "idx_notification_user_created", columnList = "user_id, created_at DESC"),
        Index(name = "idx_notification_user_unread", columnList = "user_id, is_read"),
        Index(name = "idx_notification_action_target", columnList = "action_type, action_target_id")
    ]
)
class NotificationEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(name = "user_id", nullable = false)
    val userId: Long,

    @Column(name = "message_code", nullable = false)
    val messageCode: NotificationMessageCode,

    @Column(name = "message_args", columnDefinition = "TEXT")
    val messageArgs: String,

    @Column(name = "is_read", nullable = false)
    var isRead: Boolean = false,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "action_type", nullable = false)
    val actionType: NotificationActionType = NotificationActionType.NONE,

    @Column(name = "action_target_id")
    val actionTargetId: Long? = null,

    @Column(name = "is_action_available", nullable = false)
    var isActionAvailable: Boolean = true
)

