package com.medicalsystem.backend.service.sms

import com.medicalsystem.backend.exception.TooManyRequestsException
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class SmsRateLimitServiceTest {

    private var now: Long = 1_700_000_000_000L

    private lateinit var limiter: SmsRateLimitService

    @BeforeEach
    fun setUp() {
        limiter = SmsRateLimitService(
            enabled = true,
            hourlyLimit = 5,
            dailyLimit = 20,
            windowMillis = 3_600_000L,
            clock = { now }
        )
    }

    private fun call(ip: String = "1.2.3.4") {
        limiter.checkAndRecord(ip)
    }

    @Test
    fun `allows up to hourly limit then throws 429`() {
        repeat(5) { call() }
        val ex = assertThrows<TooManyRequestsException> { call() }
        assertTrue(ex.message!!.contains("发送过于频繁"))
    }

    @Test
    fun `limits are per ip`() {
        repeat(5) { call("1.2.3.4") }
        assertThrows<TooManyRequestsException> { call("1.2.3.4") }
        // Different IP unaffected
        assertDoesNotThrow { call("5.6.7.8") }
    }

    @Test
    fun `hourly window slides and frees capacity after one hour`() {
        repeat(5) { call() }
        assertThrows<TooManyRequestsException> { call() }
        // Advance past the sliding window: all 5 recorded requests are now outside
        now += 3_600_001L
        assertDoesNotThrow { call() }
    }

    @Test
    fun `daily quota blocks after daily limit even with sliding hourly capacity`() {
        // A narrow hourly window keeps the hourly path clear so the daily cap is what trips;
        // 20 sends 1.5s apart stay inside one calendar day.
        val dailyLimiter = SmsRateLimitService(
            enabled = true, hourlyLimit = 5, dailyLimit = 20,
            windowMillis = 1_000L, clock = { now }
        )
        repeat(20) {
            dailyLimiter.checkAndRecord("8.8.8.8")
            now += 1_500L
        }
        val ex = assertThrows<TooManyRequestsException> { dailyLimiter.checkAndRecord("8.8.8.8") }
        assertTrue(ex.message!!.contains("今日短信发送次数已达上限"))
    }

    @Test
    fun `daily quota resets on next calendar day`() {
        val dailyLimiter = SmsRateLimitService(
            enabled = true, hourlyLimit = 5, dailyLimit = 20,
            windowMillis = 1_000L, clock = { now }
        )
        repeat(20) {
            dailyLimiter.checkAndRecord("8.8.8.8")
            now += 1_500L
        }
        assertThrows<TooManyRequestsException> { dailyLimiter.checkAndRecord("8.8.8.8") }
        // Jump past midnight (>= 1 day)
        now += 24 * 3_600_000L + 60_000L
        assertDoesNotThrow { dailyLimiter.checkAndRecord("8.8.8.8") }
    }

    @Test
    fun `disabled limiter is a no-op`() {
        val disabled = SmsRateLimitService(
            enabled = false, hourlyLimit = 1, dailyLimit = 1,
            windowMillis = 3_600_000L, clock = { now }
        )
        repeat(10) { disabled.checkAndRecord("9.9.9.9") }
    }

    @Test
    fun `clearForTesting resets all counters`() {
        repeat(5) { call() }
        assertThrows<TooManyRequestsException> { call() }
        limiter.clearForTesting()
        assertDoesNotThrow { call() }
    }
}
