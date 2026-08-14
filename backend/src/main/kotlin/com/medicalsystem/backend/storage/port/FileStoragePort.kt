package com.medicalsystem.backend.storage.port

import java.net.URL
import java.time.Duration

interface FileStoragePort {
    fun generatePresignedUploadUrl(storageKey: String, mimeType: String, sizeBytes: Long, duration: Duration): URL
    fun generatePresignedDownloadUrl(
        storageKey: String,
        originalFilename: String,
        mimeType: String,
        intent: com.medicalsystem.backend.storage.domain.DownloadIntent,
        duration: Duration
    ): URL
    fun getObjectHeaderBytes(storageKey: String, lengthBytes: Long): ByteArray
    fun getObjectSize(storageKey: String): Long
    fun deleteObject(storageKey: String)
}
