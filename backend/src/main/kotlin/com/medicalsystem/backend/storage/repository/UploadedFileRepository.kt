package com.medicalsystem.backend.storage.repository

import com.medicalsystem.backend.storage.domain.FileStatus
import com.medicalsystem.backend.storage.entity.UploadedFileEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.time.LocalDateTime

@Repository
interface UploadedFileRepository : JpaRepository<UploadedFileEntity, Long> {
    fun findAllByStatusAndCreatedAtBefore(status: FileStatus, threshold: LocalDateTime): List<UploadedFileEntity>
    fun findAllByDeletedAtIsNotNullAndDeletedAtBefore(threshold: LocalDateTime): List<UploadedFileEntity>
}
