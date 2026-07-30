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
    fun getNotifications(): ResponseEntity<List<NotificationDto>> {
        // Implementation will call service to get notifications for the authenticated user
        return ResponseEntity.ok(emptyList())
    }
}