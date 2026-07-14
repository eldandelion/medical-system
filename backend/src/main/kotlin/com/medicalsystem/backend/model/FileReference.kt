package com.medicalsystem.backend.model

import java.net.URI

data class FileReference(
    val name: String,
    val sizeBytes: Long,
    val url: URI
) {
    init {
        require(name.isNotBlank()) { "Attachment name cannot be blank." }
        require(sizeBytes > 0) { "Attachment size must be strictly greater than 0 bytes." }
        require(url.scheme == "https" || url.scheme == "http") {
            "File URL must be an HTTP or HTTPS link."
        }
    }
}
