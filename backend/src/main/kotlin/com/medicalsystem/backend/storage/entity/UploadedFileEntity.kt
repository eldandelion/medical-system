package com.medicalsystem.backend.storage.entity

import com.medicalsystem.backend.storage.domain.FileCategory
import com.medicalsystem.backend.storage.domain.FileStatus
import jakarta.persistence.*
import java.time.LocalDateTime

@Entity
@Table(
    name = "uploaded_files",
    indexes = [
        Index(name = "idx_uploaded_files_user", columnList = "uploaded_by_id, created_at")
    ]
)
class UploadedFileEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "storage_path", nullable = false, length = 500)
    var storageKey: String,

    @Column(name = "original_name", nullable = false, length = 255)
    var originalName: String,

    @Column(name = "mime_type", nullable = false, length = 100)
    var mimeType: String,

    @Column(name = "size_bytes", nullable = false)
    var sizeBytes: Long,

    @Column(name = "uploaded_by_id", nullable = false)
    var uploadedById: Long,

    @Column(nullable = false)
    var category: FileCategory,

    @Column(nullable = false)
    var status: FileStatus,

    @Column(name = "created_at", nullable = false)
    var createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "deleted_at", nullable = true)
    var deletedAt: LocalDateTime? = null
)
