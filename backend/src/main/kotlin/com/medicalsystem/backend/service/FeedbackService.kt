package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.FeedbackAttachmentDto
import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ReferralStateException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.storage.service.FileApplicationService
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URI

@Service
class FeedbackService(
    private val referralRepository: ReferralRepository,
    private val userRepository: UserRepository,
    private val fileApplicationService: FileApplicationService? = null,
    private val eventPublisher: DomainEventPublisher? = null
) {

    @Transactional
    fun submitFeedback(request: FeedbackCreationRequest, doctorId: Long) {
        val referral = fetchReferral(request.referralId)

        if (request.attachments.any { it.sizeBytes < 0 }) {
            throw IllegalArgumentException("Attachment size cannot be negative")
        }

        val fileIds = request.attachments.mapNotNull { it.fileId }
        val claimedFiles = if (fileIds.isNotEmpty() && fileApplicationService != null) {
            fileApplicationService.claimFiles(fileIds, doctorId).associateBy { it.id!! }
        } else {
            emptyMap()
        }

        val attachments = request.attachments.map { dto ->
            val claimed = dto.fileId?.let { claimedFiles[it] }
            FeedbackAttachment(
                id = null,
                file = FileReference(
                    name = claimed?.originalName ?: dto.name,
                    sizeBytes = claimed?.sizeBytes ?: dto.sizeBytes,
                    url = URI("http://mock-url.com")
                ),
                fileId = dto.fileId
            )
        }

        referral.addFeedback(
            content = request.content,
            attachments = attachments,
            actorId = doctorId
        )

        val saved = referralRepository.save(referral)
        referral.getDomainEvents().forEach { eventPublisher?.publish(it) }
    }

    private fun fetchReferral(referralId: Long): Referral {
        return referralRepository.findById(referralId)
            .orElseThrow { IllegalArgumentException("Referral not found") }
    }
}
