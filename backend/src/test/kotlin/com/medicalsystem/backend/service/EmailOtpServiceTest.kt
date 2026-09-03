package com.medicalsystem.backend.service

import com.medicalsystem.backend.event.DomainEvent
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.OtpChallengeIssuedEvent
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
    private lateinit var fakeDomainEventPublisher: FakeDomainEventPublisher
    private var currentInstant: Instant = Instant.parse("2026-08-30T10:00:00Z")

    private val mutableClock = object : Clock() {
        override fun getZone(): ZoneId = ZoneId.of("UTC")
        override fun withZone(zone: ZoneId?): Clock = this
        override fun instant(): Instant = currentInstant
    }

    class FakeDomainEventPublisher : DomainEventPublisher {
        val publishedEvents = mutableListOf<DomainEvent>()
        override fun publish(event: DomainEvent) {
            publishedEvents.add(event)
        }
    }

    @BeforeEach
    fun setUp() {
        fakeDomainEventPublisher = FakeDomainEventPublisher()
        emailOtpService = EmailOtpService(fakeDomainEventPublisher, mutableClock)
    }

    @Test
    fun `sendOtp generates 6-digit OTP, publishes OtpChallengeIssuedEvent, and returns 60s cooldown`() {
        val cooldown = emailOtpService.sendOtp("teacher@csu.edu.cn")
        assertEquals(60, cooldown)
        assertEquals(1, fakeDomainEventPublisher.publishedEvents.size)

        val event = fakeDomainEventPublisher.publishedEvents.first() as OtpChallengeIssuedEvent
        assertEquals("teacher@csu.edu.cn", event.email.value)
        assertEquals(6, event.code.value.length)
        assertTrue(event.code.value.all { it.isDigit() })
        assertEquals(5, event.expiresInMinutes)
    }

    @Test
    fun `sendOtp rejects invalid email formats`() {
        assertThrows<ValidationException> {
            emailOtpService.sendOtp("notanemail")
        }
        assertEquals(0, fakeDomainEventPublisher.publishedEvents.size)
    }

    @Test
    fun `sendOtp rejects disposable email domains`() {
        assertThrows<ValidationException> {
            emailOtpService.sendOtp("hacker@mailinator.com")
        }
        assertEquals(0, fakeDomainEventPublisher.publishedEvents.size)
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
        assertEquals(2, fakeDomainEventPublisher.publishedEvents.size)
    }

    @Test
    fun `verifyAndConsume succeeds with correct code and fails on replay`() {
        emailOtpService.sendOtp("doctor@csu.edu.cn")

        val event = fakeDomainEventPublisher.publishedEvents.first() as OtpChallengeIssuedEvent
        val generatedCode = event.code.value

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
