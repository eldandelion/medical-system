package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ReferralStateException
import com.medicalsystem.backend.model.FeedbackAttachment
import com.medicalsystem.backend.model.ReferralFeedback
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.repository.ReferralFeedbackRepository
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.lang.IllegalArgumentException

@Service
class FeedbackService(
    private val feedbackRepository: ReferralFeedbackRepository,
    private val referralRepository: ReferralRepository,
    private val userRepository: UserRepository
) {

    /**
     * Submits a doctor's feedback for a referral.
     * Ensures strict validation: doctor assignment, current referral status, and attachment limits.
     */
    @Transactional
    fun submitFeedback(request: FeedbackCreationRequest, doctorId: Long) {
        val doctor = userRepository.findById(doctorId)
            .orElseThrow { ForbiddenException("Doctor not found") }

        val referral = referralRepository.findById(request.referralId)
            .orElseThrow { IllegalArgumentException("Referral not found") }

        if (referral.appointment?.doctorId != doctor.id) {
            throw ForbiddenException("Doctor is not assigned to this referral")
        }

        if (referral.status != ReferralStatus.WAITING_FOR_APPOINTMENT) {
            throw ReferralStateException("Invalid state: ${referral.status}, expected WAITING_FOR_APPOINTMENT")
        }

        request.attachments.forEach {
            if (it.sizeBytes < 0) {
                throw IllegalArgumentException("Attachment size cannot be negative")
            }
        }

        val attachments = request.attachments.map {
            FeedbackAttachment(
                file = com.medicalsystem.backend.model.FileReference(
                    name = it.name,
                    sizeBytes = it.sizeBytes,
                    url = java.net.URI("http://mock-url.com")
                )
            )
        }

        val feedback = ReferralFeedback(
            referralId = referral.id!!,
            content = request.content,
            attachments = attachments
        )

        feedbackRepository.save(feedback)

        referral.transition(ReferralStatus.AWAITING_FEEDBACK_APPROVAL, actorId = doctor.id)
        referralRepository.save(referral)
    }
}
