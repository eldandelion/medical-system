package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.service.FeedbackService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

import jakarta.validation.Valid

@RestController
@RequestMapping("/api/feedback")
class FeedbackController(
    private val feedbackService: FeedbackService
) {

    @PostMapping
    fun submitFeedback(
        @Valid @RequestBody request: FeedbackCreationRequest,
        @CurrentUser user: User?
    ): ResponseEntity<Void> {
        if (user == null) throw ForbiddenException("Missing authentication token")
        feedbackService.submitFeedback(request, user.id)
        return ResponseEntity.ok().build()
    }
}
