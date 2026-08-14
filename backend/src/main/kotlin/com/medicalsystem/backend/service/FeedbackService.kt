package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.FeedbackAttachmentDto
import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ReferralStateException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.net.URI

@Service
class FeedbackService(
    private val referralRepository: ReferralRepository,
    private val userRepository: UserRepository
) {

    @Transactional
    fun submitFeedback(request: FeedbackCreationRequest, doctorId: Long) {
        val referral = fetchReferral(request.referralId)

        if (request.attachments.any { it.sizeBytes < 0 }) {
            throw IllegalArgumentException("Attachment size cannot be negative")
        }

        referral.addFeedback(
            content = request.content,
            attachments = buildAttachments(request.attachments),
            actorId = doctorId
        )

        referralRepository.save(referral)
    }

    private fun fetchReferral(referralId: Long): Referral {
        return referralRepository.findById(referralId)
            .orElseThrow { IllegalArgumentException("Referral not found") }
    }

    private fun buildAttachments(dtos: List<FeedbackAttachmentDto>): List<FeedbackAttachment> {
        return dtos.map {
            FeedbackAttachment(
                id = null,
                file = FileReference(
                    name = it.name,
                    sizeBytes = it.sizeBytes,
                    url = URI("http://mock-url.com")
                ),
                fileId = it.fileId
            )
        }
    }
}
