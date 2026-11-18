package com.medicalsystem.backend.service.sms

import com.medicalsystem.backend.exception.TooManyRequestsException
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.time.Instant
import java.time.ZoneId
import java.util.concurrent.CountDownLatch
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicInteger

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

    @Test
    fun `hourly rate limit exception exposes positive retryAfterSeconds`() {
        repeat(5) { call() }
        val ex = assertThrows<TooManyRequestsException> { call() }
        assertEquals(3600L, ex.retryAfterSeconds)
    }

    @Test
    fun `non-positive limits reject with TooManyRequestsException instead of NoSuchElementException`() {
        val zeroHourly = SmsRateLimitService(
            enabled = true, hourlyLimit = 0, dailyLimit = 20,
            windowMillis = 3_600_000L, clock = { now }
        )
        assertThrows<TooManyRequestsException> { zeroHourly.checkAndRecord("1.2.3.4") }

        val zeroDaily = SmsRateLimitService(
            enabled = true, hourlyLimit = 5, dailyLimit = 0,
            windowMillis = 3_600_000L, clock = { now }
        )
        assertThrows<TooManyRequestsException> { zeroDaily.checkAndRecord("1.2.3.4") }
    }

    @Test
    fun `concurrent bursts never exceed hourly limit`() {
        repeat(10) { iteration ->
            val burstLimiter = SmsRateLimitService(
                enabled = true,
                hourlyLimit = 5,
                dailyLimit = 20,
                windowMillis = 3_600_000L,
                clock = { now }
            )
            val threads = 24
            val ready = CountDownLatch(threads)
            val start = CountDownLatch(1)
            val done = CountDownLatch(threads)
            val allowed = AtomicInteger(0)
            val rejected = AtomicInteger(0)
            val pool = Executors.newFixedThreadPool(threads)

            repeat(threads) {
                pool.submit {
                    ready.countDown()
                    start.await()
                    try {
                        burstLimiter.checkAndRecord("10.0.0.$iteration")
                        allowed.incrementAndGet()
                    } catch (_: TooManyRequestsException) {
                        rejected.incrementAndGet()
                    } finally {
                        done.countDown()
                    }
                }
            }

            assertTrue(ready.await(5, TimeUnit.SECONDS))
            start.countDown()
            assertTrue(done.await(5, TimeUnit.SECONDS))
            pool.shutdownNow()

            assertEquals(5, allowed.get(), "iteration $iteration allowed=${allowed.get()}")
            assertEquals(threads - 5, rejected.get(), "iteration $iteration rejected=${rejected.get()}")
        }
    }

    @Test
    fun `daily quota resets at midnight in configured ZoneId rather than UTC`() {
        val shanghai = ZoneId.of("Asia/Shanghai")
        // 2024-01-15T15:50:00Z == 2024-01-15 23:50:00 CST (UTC+8)
        var t = Instant.parse("2024-01-15T15:50:00Z").toEpochMilli()
        val tzLimiter = SmsRateLimitService(
            enabled = true,
            hourlyLimit = 10,
            dailyLimit = 2,
            windowMillis = 1_000L,
            zoneId = shanghai,
            clock = { t }
        )
        tzLimiter.checkAndRecord("8.8.8.8")
        t += 5_000L
        tzLimiter.checkAndRecord("8.8.8.8")

        // Still 23:50:05 CST on 2024-01-15 -> daily quota exhausted, retryAfterSeconds ~595s
        val ex = assertThrows<TooManyRequestsException> { tzLimiter.checkAndRecord("8.8.8.8") }
        assertEquals(595L, ex.retryAfterSeconds)

        // Advance to 2024-01-15T16:00:01Z == 2024-01-16 00:00:01 CST -> new day in Shanghai!
        t = Instant.parse("2024-01-15T16:00:01Z").toEpochMilli()
        assertDoesNotThrow { tzLimiter.checkAndRecord("8.8.8.8") }
    }

    @Test
    fun `cache remains bounded under many distinct IPs`() {
        val boundedLimiter = SmsRateLimitService(
            enabled = true,
            hourlyLimit = 5,
            dailyLimit = 20,
            windowMillis = 3_600_000L,
            maxTrackedIps = 10L,
            clock = { now }
        )
        repeat(50) { i ->
            boundedLimiter.checkAndRecord("192.0.2.$i")
        }
        assertTrue(
            boundedLimiter.trackedIpCount() <= 10L,
            "tracked IP count should stay bounded at <= 10, got ${boundedLimiter.trackedIpCount()}"
        )
    }
}
