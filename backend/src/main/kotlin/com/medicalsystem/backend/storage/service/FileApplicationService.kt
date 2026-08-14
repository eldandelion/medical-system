package com.medicalsystem.backend.storage.service

import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.storage.domain.FileCategory
import com.medicalsystem.backend.storage.domain.FileStatus
import com.medicalsystem.backend.storage.dto.CompleteUploadResponse
import com.medicalsystem.backend.storage.dto.DownloadUrlResponse
import com.medicalsystem.backend.storage.dto.UploadIntentRequest
import com.medicalsystem.backend.storage.dto.UploadIntentResponse
import com.medicalsystem.backend.storage.entity.UploadedFileEntity
import com.medicalsystem.backend.storage.port.FileStoragePort
import com.medicalsystem.backend.storage.repository.UploadedFileRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Duration
import java.util.UUID

@Service
@Transactional
class FileApplicationService(
    private val uploadedFileRepository: UploadedFileRepository,
    private val fileStoragePort: FileStoragePort,
    private val fileValidationService: FileValidationService,
    private val referralRepository: ReferralRepository
) {
    private val logger = LoggerFactory.getLogger(FileApplicationService::class.java)

    companion object {
        const val MAX_AVATAR_SIZE = 5L * 1024L * 1024L // 5MB
        const val MAX_ATTACHMENT_SIZE = 25L * 1024L * 1024L // 25MB
        val UPLOAD_PRESIGN_DURATION: Duration = Duration.ofMinutes(5)
        val DOWNLOAD_PRESIGN_DURATION: Duration = Duration.ofSeconds(60)
    }

    fun requestUploadIntent(req: UploadIntentRequest, user: User): UploadIntentResponse {
        val maxAllowed = if (req.category == FileCategory.AVATAR) MAX_AVATAR_SIZE else MAX_ATTACHMENT_SIZE
        if (req.sizeBytes > maxAllowed) {
            throw ValidationException("File size exceeds maximum allowed limit of $maxAllowed bytes")
        }

        if (!fileValidationService.isAllowedMimeType(req.mimeType)) {
            throw ValidationException("Unsupported MIME type: ${req.mimeType}")
        }

        val extension = req.filename.substringAfterLast('.', "")
        val sanitizedExt = if (extension.isNotBlank()) ".$extension" else ""
        val storagePrefix = when (req.category) {
            FileCategory.AVATAR -> "avatars"
            FileCategory.REFERRAL_ATTACHMENT -> "referrals"
            FileCategory.FEEDBACK_ATTACHMENT -> "feedback"
        }
        val storageKey = "$storagePrefix/${UUID.randomUUID()}$sanitizedExt"

        val entity = UploadedFileEntity(
            storageKey = storageKey,
            originalName = req.filename,
            mimeType = req.mimeType,
            sizeBytes = req.sizeBytes,
            uploadedById = user.id,
            category = req.category,
            status = FileStatus.PENDING_UPLOAD
        )
        val saved = uploadedFileRepository.save(entity)

        val presignedUrl = fileStoragePort.generatePresignedUploadUrl(
            storageKey = storageKey,
            mimeType = req.mimeType,
            sizeBytes = req.sizeBytes,
            duration = UPLOAD_PRESIGN_DURATION
        )

        return UploadIntentResponse(
            fileId = saved.id!!,
            presignedUploadUrl = presignedUrl.toString(),
            storageKey = storageKey,
            expiresInSeconds = UPLOAD_PRESIGN_DURATION.seconds
        )
    }

    fun completeUpload(fileId: Long, user: User): CompleteUploadResponse {
        val file = uploadedFileRepository.findById(fileId).orElseThrow {
            ResourceNotFoundException("File with ID $fileId not found")
        }

        if (file.uploadedById != user.id && user.role != UserRole.SYSTEM_ADMIN) {
            throw ForbiddenException("Unauthorized to complete upload for this file")
        }

        if (file.status == FileStatus.ACTIVE) {
            return CompleteUploadResponse(file.id!!, file.status)
        }

        return try {
            val headerBytes = fileStoragePort.getObjectHeaderBytes(file.storageKey, 4096)
            val isValid = fileValidationService.validateHeader(headerBytes, file.mimeType)

            if (isValid) {
                file.status = FileStatus.ACTIVE
                uploadedFileRepository.save(file)
                logger.info("File ID {} successfully verified and activated", fileId)
                CompleteUploadResponse(file.id!!, FileStatus.ACTIVE)
            } else {
                logger.warn("File ID {} failed validation, rejecting and deleting object", fileId)
                file.status = FileStatus.REJECTED
                uploadedFileRepository.save(file)
                fileStoragePort.deleteObject(file.storageKey)
                CompleteUploadResponse(file.id!!, FileStatus.REJECTED)
            }
        } catch (ex: Exception) {
            logger.error("Error verifying uploaded file ID $fileId", ex)
            file.status = FileStatus.REJECTED
            uploadedFileRepository.save(file)
            runCatching { fileStoragePort.deleteObject(file.storageKey) }
            CompleteUploadResponse(file.id!!, FileStatus.REJECTED)
        }
    }

    fun claimFiles(fileIds: List<Long>, uploaderId: Long): List<UploadedFileEntity> {
        if (fileIds.isEmpty()) return emptyList()
        val files = uploadedFileRepository.findAllById(fileIds)
        if (files.size != fileIds.size) {
            throw ResourceNotFoundException("Some file IDs were not found")
        }
        for (file in files) {
            if (file.uploadedById != uploaderId) {
                throw ForbiddenException("Cannot claim file ID ${file.id} not owned by caller")
            }
            if (file.status != FileStatus.ACTIVE) {
                throw ValidationException("File ID ${file.id} is not in ACTIVE verified status")
            }
        }
        return files
    }

    @Transactional(readOnly = true)
    fun getReferralAttachmentDownloadUrl(
        referralId: Long,
        fileId: Long,
        intent: com.medicalsystem.backend.storage.domain.DownloadIntent = com.medicalsystem.backend.storage.domain.DownloadIntent.DOWNLOAD,
        user: User
    ): DownloadUrlResponse {
        val referral = referralRepository.findById(referralId).orElseThrow {
            ResourceNotFoundException("Referral with ID $referralId not found")
        }

        val visibleReferrals = referralRepository.findVisibleReferralsFor(user)
        if (visibleReferrals.none { it.id == referralId }) {
            throw ForbiddenException("Unauthorized to access attachments on referral $referralId")
        }

        referral.assertCanAccessAttachment(fileId)

        val file = uploadedFileRepository.findById(fileId).orElseThrow {
            ResourceNotFoundException("File with ID $fileId not found")
        }

        val presignedUrl = fileStoragePort.generatePresignedDownloadUrl(
            storageKey = file.storageKey,
            originalFilename = file.originalName,
            mimeType = file.mimeType,
            intent = intent,
            duration = DOWNLOAD_PRESIGN_DURATION
        )

        return DownloadUrlResponse(
            downloadUrl = presignedUrl.toString(),
            expiresInSeconds = DOWNLOAD_PRESIGN_DURATION.seconds
        )
    }
}
