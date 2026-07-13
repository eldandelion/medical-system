package com.medicalsystem.backend.model

data class FeedbackAttachment(
    val id: Long = 0,
    val name: String,
    val sizeBytes: Long,
    val fileUrl: String? = null
)
