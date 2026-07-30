package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.NotificationDto
import com.medicalsystem.backend.service.NotificationService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/notifications")
class NotificationController(
    private val notificationService: NotificationService
) {
    @GetMapping
    fun getNotifications(@com.medicalsystem.backend.security.CurrentUser user: com.medicalsystem.backend.model.User): ResponseEntity<List<NotificationDto>> {
        val notifications = notificationService.getNotificationsForUser(user.id)
        return ResponseEntity.ok(notifications.map { 
            NotificationDto(
                id = it.id ?: 0L,
                userId = it.userId,
                messageCode = it.messageCode,
                messageArgs = it.messageArgs,
                isRead = it.isRead,
                createdAt = it.createdAt,
                actionType = it.actionType,
                actionTargetId = it.actionTargetId,
                isActionAvailable = it.isActionAvailable
            ) 
        })
    }

    @PatchMapping("/{id}/read")
    fun markAsRead(@PathVariable id: Long, @com.medicalsystem.backend.security.CurrentUser user: com.medicalsystem.backend.model.User): ResponseEntity<Void> {
        notificationService.markAsRead(id, user.id)
        return ResponseEntity.ok().build()
    }
}