package com.medicalsystem.backend.model

enum class NotificationMessageCode(val code: Int) {
    REFERRAL_INITIATED(1),
    REFERRAL_STATUS_CHANGED(2),
    APPOINTMENT_SCHEDULED(3),
    EVALUATION_COMPLETED(4),
    REFERRAL_SUBMITTED_STUDENT(5),
    REFERRAL_SUBMITTED_INITIATOR(6),
    REFERRAL_REQUIRES_REVIEW_HC(7);

    companion object {
        fun fromCode(code: Int): NotificationMessageCode = entries.find { it.code == code }
            ?: throw IllegalArgumentException("Unknown NotificationMessageCode code: $code")
    }
}
