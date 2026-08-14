package com.medicalsystem.backend.model

data class FeedbackAttachment(
    val id: Long? = null,
    val file: FileReference,
    val fileId: Long? = null
)
