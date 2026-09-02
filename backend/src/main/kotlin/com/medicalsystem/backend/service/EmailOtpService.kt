package com.medicalsystem.backend.service

import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.DisposableEmailBlacklist
import com.medicalsystem.backend.model.EmailAddress
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import java.security.SecureRandom
import java.time.Clock
import java.time.Duration
import java.time.Instant
import java.util.concurrent.ConcurrentHashMap

@Service
class EmailOtpService(
    private val clock: Clock = Clock.systemDefaultZone()
) {
    private val logger = LoggerFactory.getLogger(EmailOtpService::class.java)
    private val random = SecureRandom()

    private val otpStore = ConcurrentHashMap<String, OtpRecord>()

    data class OtpRecord(
        val code: String,
        val createdAt: Instant,
        val expiresAt: Instant,
        val cooldownUntil: Instant,
        var attemptsRemaining: Int
    )

    fun sendOtp(rawEmail: String): Int {
        val email = rawEmail.trim().lowercase()

        if (!EmailAddress.isValid(email)) {
            throw ValidationException("INVALID_EMAIL_FORMAT")
        }

        if (DisposableEmailBlacklist.isDisposable(email)) {
            throw ValidationException("DISPOSABLE_EMAIL_NOT_ALLOWED")
        }

        val now = Instant.now(clock)
        cleanExpiredRecords(now)

        val existing = otpStore[email]
        if (existing != null && now.isBefore(existing.cooldownUntil)) {
            val secondsRemaining = Duration.between(now, existing.cooldownUntil).seconds.coerceAtLeast(1)
            throw ConflictException("OTP_COOLDOWN_ACTIVE:$secondsRemaining")
        }

        val code = String.format("%06d", random.nextInt(1_000_000))
        val record = OtpRecord(
            code = code,
            createdAt = now,
            expiresAt = now.plus(Duration.ofMinutes(5)),
            cooldownUntil = now.plus(Duration.ofSeconds(60)),
            attemptsRemaining = 3
        )

        otpStore[email] = record
        logger.info("Generated Email OTP for {}: code={} (expires at {})", email, code, record.expiresAt)

        return 60
    }

    fun verifyAndConsume(rawEmail: String, rawCode: String): Boolean {
        val email = rawEmail.trim().lowercase()
        val code = rawCode.trim()

        val now = Instant.now(clock)
        val record = otpStore[email]

        if (record == null || now.isAfter(record.expiresAt)) {
            otpStore.remove(email)
            throw ValidationException("OTP_EXPIRED_OR_NOT_FOUND")
        }

        if (record.attemptsRemaining <= 0) {
            otpStore.remove(email)
            throw ValidationException("OTP_MAX_ATTEMPTS_EXCEEDED")
        }

        record.attemptsRemaining -= 1

        if (record.code != code) {
            if (record.attemptsRemaining <= 0) {
                otpStore.remove(email)
                throw ValidationException("OTP_MAX_ATTEMPTS_EXCEEDED")
            }
            throw ValidationException("INVALID_OTP_CODE")
        }

        otpStore.remove(email)
        logger.info("Successfully verified and consumed Email OTP for {}", email)
        return true
    }

    fun clearAll() {
        otpStore.clear()
    }

    private fun cleanExpiredRecords(now: Instant) {
        if (otpStore.size > 500) {
            otpStore.entries.removeIf { now.isAfter(it.value.expiresAt) }
        }
    }
}
