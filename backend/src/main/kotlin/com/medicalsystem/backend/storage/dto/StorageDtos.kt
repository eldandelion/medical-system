package com.medicalsystem.backend.storage.dto

import com.medicalsystem.backend.storage.domain.FileCategory
import com.medicalsystem.backend.storage.domain.FileStatus
import jakarta.validation.constraints.NotBlank
import jakarta.validation.constraints.NotNull
import jakarta.validation.constraints.Positive

data class UploadIntentRequest(
    @field:NotBlank(message = "Filename must not be blank")
    val filename: String,

    @field:Positive(message = "Size must be strictly positive")
    val sizeBytes: Long,

    @field:NotBlank(message = "MIME type must not be blank")
    val mimeType: String,

    @field:NotNull(message = "Category must not be null")
    val category: FileCategory
)

data class UploadIntentResponse(
    val fileId: Long,
    val presignedUploadUrl: String,
    val storageKey: String,
    val expiresInSeconds: Long
)

data class CompleteUploadResponse(
    val fileId: Long,
    val status: FileStatus
)

data class DownloadUrlResponse(
    val downloadUrl: String,
    val expiresInSeconds: Long
)
