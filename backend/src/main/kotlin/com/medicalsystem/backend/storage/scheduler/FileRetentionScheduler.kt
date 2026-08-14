package com.medicalsystem.backend.storage.scheduler

import com.medicalsystem.backend.storage.domain.FileStatus
import com.medicalsystem.backend.storage.port.FileStoragePort
import com.medicalsystem.backend.storage.repository.UploadedFileRepository
import net.javacrumbs.shedlock.spring.annotation.SchedulerLock
import org.slf4j.LoggerFactory
import org.springframework.scheduling.annotation.Scheduled
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Component
class FileRetentionScheduler(
    private val uploadedFileRepository: UploadedFileRepository,
    private val fileStoragePort: FileStoragePort
) {
    private val logger = LoggerFactory.getLogger(FileRetentionScheduler::class.java)

    @Scheduled(cron = "0 0 3 * * ?") // 03:00 AM daily
    @SchedulerLock(name = "purgeStaleFilesLock", lockAtLeastFor = "PT1M", lockAtMostFor = "PT15M")
    @Transactional
    fun purgeStaleFiles() {
        // 1. Purge abandoned PENDING_UPLOAD files older than 24 hours
        val stalePendingThreshold = LocalDateTime.now().minusHours(24)
        val stalePendingFiles = uploadedFileRepository.findAllByStatusAndCreatedAtBefore(
            FileStatus.PENDING_UPLOAD,
            stalePendingThreshold
        )

        for (file in stalePendingFiles) {
            runCatching {
                fileStoragePort.deleteObject(file.storageKey)
                uploadedFileRepository.delete(file)
                logger.info("Purged abandoned pending file id={}", file.id)
            }.onFailure { ex ->
                logger.error("Failed to purge stale pending file id=${file.id}", ex)
            }
        }

        // 2. Purge non-clinical SOFT_DELETED files older than 7 days
        val staleDeletedThreshold = LocalDateTime.now().minusDays(7)
        val staleDeletedFiles = uploadedFileRepository.findAllByDeletedAtIsNotNullAndDeletedAtBefore(
            staleDeletedThreshold
        )

        for (file in staleDeletedFiles) {
            runCatching {
                fileStoragePort.deleteObject(file.storageKey)
                uploadedFileRepository.delete(file)
                logger.info("Purged soft-deleted file id={}", file.id)
            }.onFailure { ex ->
                logger.error("Failed to purge soft-deleted file id=${file.id}", ex)
            }
        }
    }
}
