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
        private val VALID_PROVINCE_CODES = setOf(
            "11", "12", "13", "14", "15",
            "21", "22", "23",
            "31", "32", "33", "34", "35", "36", "37",
            "41", "42", "43", "44", "45", "46",
            "50", "51", "52", "53", "54",
            "61", "62", "63", "64", "65",
            "71", "81", "82"
        )

        private val WEIGHTS = intArrayOf(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2)
        private val CHECK_CHARS = charArrayOf('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2')
        val PATTERN = Regex("^[1-9]\\d{5}(18|19|20)\\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\\d{3}[0-9Xx]$")

        fun isValid(raw: String?): Boolean {
            if (raw.isNullOrBlank()) return false
            val upper = raw.trim().uppercase()
            if (upper.length != 18) return false
            if (!PATTERN.matches(upper)) return false

            val provinceCode = upper.substring(0, 2)
            if (!VALID_PROVINCE_CODES.contains(provinceCode)) return false

            val year = upper.substring(6, 10).toIntOrNull() ?: return false
            val month = upper.substring(10, 12).toIntOrNull() ?: return false
            val day = upper.substring(12, 14).toIntOrNull() ?: return false

            try {
                LocalDate.of(year, month, day)
            } catch (e: Exception) {
                return false
            }

            var sum = 0
            for (i in 0 until 17) {
                val digit = upper[i] - '0'
                if (digit !in 0..9) return false
                sum += digit * WEIGHTS[i]
            }
            val expectedCheck = CHECK_CHARS[sum % 11]
            return upper[17] == expectedCheck
        }

        fun fromOrNull(raw: String?): IdCardNumber? =
            raw?.trim()?.uppercase()?.takeIf { isValid(it) }?.let { IdCardNumber(it) }
    }

    val birthDate: LocalDate
        get() {
            val upper = value.uppercase()
            val year = upper.substring(6, 10).toInt()
            val month = upper.substring(10, 12).toInt()
            val day = upper.substring(12, 14).toInt()
            return LocalDate.of(year, month, day)
        }

    val gender: Gender
        get() {
            val genderDigit = value[16].digitToInt()
            return if (genderDigit % 2 != 0) Gender.MALE else Gender.FEMALE
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

@JvmInline
value class PersonName(val value: String) {
    companion object {
        // 2-20 Chinese characters with optional single middle dot (· / •) for ethnic minority names
        val CHINESE_NAME_PATTERN = Regex("^[\\u4e00-\\u9fa5]{2,20}(?:[·•][\\u4e00-\\u9fa5]{1,20})*$")
        // 2-50 Latin characters with optional single space, hyphen, or apostrophe between word groups
        val LATIN_NAME_PATTERN = Regex("^[A-Za-z]+(?:[ '\\-][A-Za-z]+)*$")

        fun isValid(raw: String?): Boolean {
            if (raw.isNullOrBlank()) return false
            val trimmed = raw.trim()
            if (trimmed.length < 2 || trimmed.length > 50) return false
            return CHINESE_NAME_PATTERN.matches(trimmed) || LATIN_NAME_PATTERN.matches(trimmed)
        }

        fun fromOrNull(raw: String?): PersonName? =
            raw?.trim()?.takeIf { isValid(it) }?.let { PersonName(it) }
    }

    init {
        require(isValid(value)) {
            "Invalid person name format."
        }
    }
}

data class BatteryId(val value: String)

data class Score(val points: Int, val max: Int)

@JvmInline
value class OtpCode(val value: String) {
    companion object {
        val PATTERN = Regex("^\\d{6}$")

        fun isValid(raw: String?): Boolean = raw != null && PATTERN.matches(raw.trim())

        fun generate(random: java.security.SecureRandom = java.security.SecureRandom()): OtpCode =
            OtpCode(String.format("%06d", random.nextInt(1_000_000)))

        fun fromOrNull(raw: String?): OtpCode? =
            raw?.trim()?.takeIf { isValid(it) }?.let { OtpCode(it) }
    }

    init {
        require(isValid(value)) {
            "OTP code must be exactly 6 digits."
        }
    }
}
