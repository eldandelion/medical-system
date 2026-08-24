package com.medicalsystem.backend.model

import java.time.LocalDate

@JvmInline
value class MobileNumber(val value: String) {
    companion object {
        val PATTERN = Regex("^1[3-9]\\d{9}$")

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw)

        fun fromOrNull(raw: String?): MobileNumber? =
            raw?.takeIf { isValid(it) }?.let { MobileNumber(it) }
    }

    init {
        require(isValid(value)) {
            "Contact number must be a valid 11-digit mobile number."
        }
    }
}

@JvmInline
value class PhoneNumber(val value: String) {
    companion object {
        val PATTERN = Regex("^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8}|[\\d+\\-\\s()]+)$")

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw)

        fun fromOrNull(raw: String?): PhoneNumber? =
            raw?.takeIf { isValid(it) }?.let { PhoneNumber(it) }
    }

    init {
        require(isValid(value)) {
            "Invalid phone number format."
        }
    }
}

@JvmInline
value class EmailAddress(val value: String) {
    companion object {
        val PATTERN = Regex("^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,6}$")

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw)

        fun fromOrNull(raw: String?): EmailAddress? =
            raw?.takeIf { isValid(it) }?.let { EmailAddress(it) }
    }

    init {
        require(isValid(value)) {
            "Invalid email format."
        }
    }
}

@JvmInline
value class IdCardNumber(val value: String) {
    companion object {
        val PATTERN = Regex(
            "^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"
        )

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw)

        fun fromOrNull(raw: String?): IdCardNumber? =
            raw?.takeIf { isValid(it) }?.let { IdCardNumber(it) }
    }

    init {
        require(isValid(value)) {
            "Invalid ID Card format."
        }
    }
}

@JvmInline
value class SchoolEmployeeId(val value: String) {
    companion object {
        val PATTERN = Regex("^[A-Za-z0-9-]{5,20}$")

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw)

        fun fromOrNull(raw: String?): SchoolEmployeeId? =
            raw?.takeIf { isValid(it) }?.let { SchoolEmployeeId(it) }
    }

    init {
        require(isValid(value)) {
            "Invalid School Employee ID format."
        }
    }
}

@JvmInline
value class HospitalEmployeeId(val value: String) {
    companion object {
        val PATTERN = Regex("^[A-Za-z0-9-]{5,20}$")

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw)

        fun fromOrNull(raw: String?): HospitalEmployeeId? =
            raw?.takeIf { isValid(it) }?.let { HospitalEmployeeId(it) }
    }

    init {
        require(isValid(value)) {
            "Invalid Hospital Employee ID format."
        }
    }
}

data class BatteryId(val value: String)

data class Score(val points: Int, val max: Int)
