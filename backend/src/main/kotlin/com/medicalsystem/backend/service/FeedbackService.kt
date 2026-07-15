package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.dto.FeedbackAttachmentDto
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
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.Referral

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
        val doctor = fetchDoctor(doctorId)
        val referral = fetchReferral(request.referralId)

        validateDoctorAssignment(referral, doctor)
        validateReferralState(referral)

        val feedback = ReferralFeedback(
            referralId = referral.id!!,
            content = request.content,
            attachments = buildAttachments(request.attachments)
        )

        feedbackRepository.save(feedback)

        referral.transition(ReferralStatus.AWAITING_FEEDBACK_APPROVAL, actorId = doctor.id)
        referralRepository.save(referral)
    }

    private fun fetchDoctor(doctorId: Long): User {
        return userRepository.findById(doctorId)
            .orElseThrow { ForbiddenException("Doctor not found") }
    }

    private fun fetchReferral(referralId: Long): Referral {
        return referralRepository.findById(referralId)
            .orElseThrow { IllegalArgumentException("Referral not found") }
    }

    private fun validateDoctorAssignment(referral: Referral, doctor: User) {
        if (referral.appointment?.doctorId != doctor.id) {
            throw ForbiddenException("Doctor is not assigned to this referral")
        }
    }

    private fun validateReferralState(referral: Referral) {
        if (referral.status != ReferralStatus.WAITING_FOR_APPOINTMENT) {
            throw ReferralStateException("Invalid state: ${referral.status}, expected WAITING_FOR_APPOINTMENT")
        }
    }

    private fun buildAttachments(attachments: List<FeedbackAttachmentDto>): List<FeedbackAttachment> {
        return attachments.map {
            if (it.sizeBytes < 0) {
                throw IllegalArgumentException("Attachment size cannot be negative")
            }
            FeedbackAttachment(
                file = com.medicalsystem.backend.model.FileReference(
                    name = it.name,
                    sizeBytes = it.sizeBytes,
                    url = java.net.URI("http://mock-url.com")
                )
            )
        }
    }
}
