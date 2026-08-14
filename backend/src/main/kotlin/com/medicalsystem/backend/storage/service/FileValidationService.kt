package com.medicalsystem.backend.storage.service

import org.apache.tika.Tika
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service

@Service
class FileValidationService {
    private val logger = LoggerFactory.getLogger(FileValidationService::class.java)
    private val tika = Tika()

    companion object {
        val ALLOWED_MIME_TYPES = setOf(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/msword"
        )
    }

    fun isAllowedMimeType(mimeType: String): Boolean {
        return ALLOWED_MIME_TYPES.contains(mimeType.lowercase())
    }

    fun validateHeader(bytes: ByteArray, declaredMime: String): Boolean {
        if (bytes.isEmpty()) {
            logger.warn("Validation failed: empty byte array")
            return false
        }
        val detected = tika.detect(bytes).lowercase()
        val normalizedDeclared = declaredMime.lowercase().trim()
        logger.info("Tika detected MIME: {} for declared MIME: {}", detected, normalizedDeclared)

        if (!isAllowedMimeType(normalizedDeclared)) {
            logger.warn("Declared MIME type {} is not in allowed whitelist", normalizedDeclared)
            return false
        }

        if (normalizedDeclared == "application/pdf") {
            return detected == "application/pdf"
        }
        if (normalizedDeclared == "image/png") {
            return detected == "image/png"
        }
        if (normalizedDeclared == "image/jpeg" || normalizedDeclared == "image/jpg") {
            return detected == "image/jpeg"
        }
        if (normalizedDeclared == "image/webp") {
            return detected == "image/webp"
        }
        if (normalizedDeclared.contains("officedocument.wordprocessingml.document")) {
            return detected == "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
                   detected == "application/x-tika-ooxml" ||
                   detected == "application/zip"
        }
        if (normalizedDeclared == "application/msword") {
            return detected == "application/msword" || detected == "application/x-tika-msoffice"
        }

        return detected == normalizedDeclared
    }
}
