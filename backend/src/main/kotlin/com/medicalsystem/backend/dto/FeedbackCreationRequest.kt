package com.medicalsystem.backend.dto

import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull

data class FeedbackCreationRequest(
    @field:NotNull(message = "referralId must not be null")
    val referralId: Long,

    @field:NotBlank(message = "content must not be blank")
    val content: String,

    val attachments: List<FeedbackAttachmentDto> = emptyList()
)

data class FeedbackAttachmentDto(
    @field:NotBlank(message = "Attachment name must not be blank")
    val name: String,
    
    val sizeBytes: Long
)
