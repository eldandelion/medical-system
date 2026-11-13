package com.medicalsystem.backend.service.sms

import com.medicalsystem.backend.exception.TooManyRequestsException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.ZoneId
import java.util.concurrent.ConcurrentHashMap

/**
 * In-memory, per-IP rate limiting and daily quota for SMS OTP sending.
 *
 * Semantics:
 * - Every /api/auth/send-code request that passes the check is recorded BEFORE the OTP is
 *   sent, so even requests that later fail OTP-side cooldown validation consume gateway
 *   quota (defends against cooldown-timing probing and SMS billing abuse).
 * - Hourly limit: sliding 1-hour window, max [hourlyLimit] requests per IP (default 5).
 * - Daily quota: max [dailyLimit] requests per IP per calendar day (server timezone),
 *   configurable for billing caps.
 * - When [enabled] is false the limiter is a no-op (still testable via clearForTesting).
 *
 * Single-replica only, mirroring the OtpService cache; a multi-replica deployment would
 * need a shared store (Redis) — noted as a known limitation.
 */
@Service
class SmsRateLimitService(
    @Value("\${sms.rate-limit.enabled:true}") private val enabled: Boolean = true,
    @Value("\${sms.rate-limit.hourly-limit:5}") private val hourlyLimit: Int = 5,
    @Value("\${sms.rate-limit.daily-limit:20}") private val dailyLimit: Int = 20,
    @Value("\${sms.rate-limit.window-millis:3600000}") private val windowMillis: Long = 3_600_000L,
    private val clock: () -> Long = { System.currentTimeMillis() }
) {
    private val log = LoggerFactory.getLogger(javaClass)

    // IP -> timestamps of recorded requests inside the sliding hourly window
    private val hourlyWindow = ConcurrentHashMap<String, ArrayDeque<Long>>()

    // IP -> daily counter; reset when the calendar day rolls over
    private data class DailyCounter(val day: LocalDate, var count: Int)

    private val dailyCounters = ConcurrentHashMap<String, DailyCounter>()

    fun checkAndRecord(ip: String) {
        if (!enabled) return
        val now = clock()
        checkHourly(ip, now)
        checkDaily(ip, now)
        record(ip, now)
    }

    private fun checkHourly(ip: String, now: Long) {
        val window = hourlyWindow.compute(ip) { _, existing -> existing ?: ArrayDeque() }!!
        synchronized(window) {
            val cutoff = now - windowMillis
            while (window.isNotEmpty() && window.first() <= cutoff) window.removeFirst()
            if (window.size >= hourlyLimit) {
                val retryInSec = ((window.first() + windowMillis - now) / 1000L).coerceAtLeast(1)
                log.warn("SMS hourly rate limit hit for ip={}: {} requests in window", ip, window.size)
                throw TooManyRequestsException("发送过于频繁，请 ${retryInSec} 秒后再试")
            }
        }
    }

    private fun checkDaily(ip: String, now: Long) {
        val today = LocalDate.ofInstant(java.time.Instant.ofEpochMilli(now), ZoneId.systemDefault())
        val counter = dailyCounters.compute(ip) { _, existing ->
            if (existing == null || existing.day != today) DailyCounter(today, 0) else existing
        }!!
        synchronized(counter) {
            if (counter.count >= dailyLimit) {
                log.warn("SMS daily quota hit for ip={}: {} sends today", ip, counter.count)
                throw TooManyRequestsException("今日短信发送次数已达上限，请明天再试")
            }
        }
    }

    private fun record(ip: String, now: Long) {
        val window = hourlyWindow.compute(ip) { _, existing -> existing ?: ArrayDeque() }!!
        synchronized(window) { window.addLast(now) }
        val today = LocalDate.ofInstant(java.time.Instant.ofEpochMilli(now), ZoneId.systemDefault())
        val counter = dailyCounters.compute(ip) { _, existing ->
            if (existing == null || existing.day != today) DailyCounter(today, 0) else existing
        }!!
        synchronized(counter) { counter.count++ }
        evictStaleEntries(now)
    }

    /** Drop windows/counters for IPs with no recent activity to bound memory usage. */
    private fun evictStaleEntries(now: Long) {
        if (hourlyWindow.size <= MAX_TRACKED_IPS) return
        val cutoff = now - windowMillis
        val today = LocalDate.ofInstant(java.time.Instant.ofEpochMilli(now), ZoneId.systemDefault())
        hourlyWindow.entries.removeIf { (_, window) ->
            synchronized(window) { window.isEmpty() || window.last() <= cutoff }
        }
        dailyCounters.entries.removeIf { (_, counter) ->
            synchronized(counter) { counter.day != today && counter.count == 0 }
        }
    }

    fun clearForTesting() {
        hourlyWindow.clear()
        dailyCounters.clear()
    }

    companion object {
        private const val MAX_TRACKED_IPS = 50_000
    }
}
