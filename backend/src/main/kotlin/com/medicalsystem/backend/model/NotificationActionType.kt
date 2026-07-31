package com.medicalsystem.backend.model

enum class NotificationActionType(val code: Int) {
    NONE(0),
    VIEW_REFERRAL(1),
    VIEW_APPOINTMENT(2),
    REVIEW_REFERRAL(3),
    CREATE_APPOINTMENT(4),
    START_ASSESSMENT(5),
    CONTINUE_ASSESSMENT(6),
    WRITE_FEEDBACK(7),
    APPROVE_FEEDBACK(8),
    ASSIGN_DOCTOR(9),
    VIEW_RECORDS(10);

    companion object {
        fun fromCode(code: Int): NotificationActionType = entries.find { it.code == code }
            ?: throw IllegalArgumentException("Unknown NotificationActionType code: $code")
    }
}
