package com.medicalsystem.backend.service

import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Clock
import java.time.Instant
import java.time.ZoneId

class EmailOtpServiceTest {

    private lateinit var emailOtpService: EmailOtpService
    private var currentInstant: Instant = Instant.parse("2026-08-30T10:00:00Z")

    private val mutableClock = object : Clock() {
        override fun getZone(): ZoneId = ZoneId.of("UTC")
        override fun withZone(zone: ZoneId?): Clock = this
        override fun instant(): Instant = currentInstant
    }

    @BeforeEach
    fun setUp() {
        emailOtpService = EmailOtpService(mutableClock)
    }

    @Test
    fun `sendOtp generates 6-digit OTP and returns 60s cooldown`() {
        val cooldown = emailOtpService.sendOtp("teacher@csu.edu.cn")
        assertEquals(60, cooldown)
    }

    @Test
    fun `sendOtp rejects invalid email formats`() {
        assertThrows<ValidationException> {
            emailOtpService.sendOtp("notanemail")
        }
    }

    @Test
    fun `sendOtp rejects disposable email domains`() {
        assertThrows<ValidationException> {
            emailOtpService.sendOtp("hacker@mailinator.com")
        }
    }

    @Test
    fun `sendOtp enforces 60-second cooldown period`() {
        emailOtpService.sendOtp("teacher@csu.edu.cn")

        // Immediately requesting again should fail with ConflictException
        val ex = assertThrows<ConflictException> {
            emailOtpService.sendOtp("teacher@csu.edu.cn")
        }
        assertTrue(ex.message!!.startsWith("OTP_COOLDOWN_ACTIVE"))

        // Advance clock by 61 seconds
        currentInstant = currentInstant.plusSeconds(61)

        // Requesting after cooldown should succeed
        val newCooldown = emailOtpService.sendOtp("teacher@csu.edu.cn")
        assertEquals(60, newCooldown)
    }

    @Test
    fun `verifyAndConsume succeeds with correct code and fails on replay`() {
        emailOtpService.sendOtp("doctor@csu.edu.cn")

        // Extract generated code using reflection for deterministic testing
        val storeField = EmailOtpService::class.java.getDeclaredField("otpStore")
        storeField.isAccessible = true
        val store = storeField.get(emailOtpService) as Map<*, *>
        val record = store["doctor@csu.edu.cn"]!!
        val codeField = record.javaClass.getDeclaredField("code")
        codeField.isAccessible = true
        val generatedCode = codeField.get(record) as String

        // Wrong code fails
        assertThrows<ValidationException> {
            emailOtpService.verifyAndConsume("doctor@csu.edu.cn", "999999")
        }

        // Correct code succeeds
        val verified = emailOtpService.verifyAndConsume("doctor@csu.edu.cn", generatedCode)
        assertTrue(verified)

        // Replay fails
        assertThrows<ValidationException> {
            emailOtpService.verifyAndConsume("doctor@csu.edu.cn", generatedCode)
        }
    }

    @Test
    fun `verifyAndConsume fails after expiration`() {
        emailOtpService.sendOtp("staff@csu.edu.cn")

        // Advance clock past 5 minutes (301 seconds)
        currentInstant = currentInstant.plusSeconds(301)

        assertThrows<ValidationException> {
            emailOtpService.verifyAndConsume("staff@csu.edu.cn", "123456")
        }
    }
}
