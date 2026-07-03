package com.medicalsystem.backend.dto

import jakarta.validation.constraints.NotBlank

data class AttachmentDto(
    @field:NotBlank(message = "Name cannot be blank")
    val name: String,
    
    @field:NotBlank(message = "Size cannot be blank")
    val size: String
)
