package com.medicalsystem.backend.model

import java.time.LocalDate

@JvmInline
value class MobileNumber(val value: String) {
    init {
        require(value.matches(Regex("^1[3-9]\\d{9}$"))) {
            "Contact number must be a valid 11-digit mobile number."
        }
    }
}

@JvmInline
value class PhoneNumber(val value: String) {
    init {
        require(value.matches(Regex("^(1[3-9]\\d{9}|0\\d{2,3}-\\d{7,8}|[\\d\\+\\-\\s()]+)$"))) {
            "Invalid phone number format."
        }
    }
}

@JvmInline
value class EmailAddress(val value: String) {
    init {
        require(value.matches(Regex("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,6}$"))) {
            "Invalid email format."
        }
    }
}

@JvmInline
value class IdCardNumber(val value: String) {
    init {
        require(value.matches(Regex("^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$"))) {
            "Invalid ID Card format."
        }
    }
}

@JvmInline
value class SchoolEmployeeId(val value: String) {
    init {
        require(value.matches(Regex("^[A-Za-z0-9-]{5,20}$"))) {
            "Invalid School Employee ID format."
        }
    }
}

@JvmInline
value class HospitalEmployeeId(val value: String) {
    init {
        require(value.matches(Regex("^[A-Za-z0-9-]{5,20}$"))) {
            "Invalid Hospital Employee ID format."
        }
    }
}

data class BatteryId(val value: String)

data class Score(val points: Int, val max: Int)

data class PsychometricTest(
    val testType: PsychometricTestType,
    val score: Score,
    val testDate: LocalDate
)
