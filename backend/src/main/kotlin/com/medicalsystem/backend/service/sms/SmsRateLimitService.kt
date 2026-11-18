package com.medicalsystem.backend.service.sms

import com.github.benmanes.caffeine.cache.Cache
import com.github.benmanes.caffeine.cache.Caffeine
import com.medicalsystem.backend.exception.TooManyRequestsException
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.util.concurrent.TimeUnit

/**
 * In-memory, per-IP rate limiting and daily quota for SMS OTP sending.
 *
 * Semantics:
 * - Every /api/auth/send-code request that passes the check is recorded atomically BEFORE
 *   the OTP is sent, so concurrent bursts cannot slip past the cap and requests that later
 *   fail OTP-side cooldown validation still consume quota.
 * - Hourly limit: sliding window, max [hourlyLimit] requests per IP (default 5 / 1h).
 * - Daily quota: max [dailyLimit] requests per IP per calendar day in [zoneId]
 *   (default Asia/Shanghai).
 * - Backed by a bounded Caffeine cache (`maximumSize` + `expireAfterAccess`) to prevent
 *   unbounded memory growth across days.
 * - When [enabled] is false the limiter is a no-op (still testable via clearForTesting).
 *
 * Single-replica only, mirroring OtpService; multi-replica deployments should use Redis.
 */
@Service
class SmsRateLimitService internal constructor(
    private val enabled: Boolean = true,
    private val hourlyLimit: Int = 5,
    private val dailyLimit: Int = 20,
    private val windowMillis: Long = 3_600_000L,
    private val zoneId: ZoneId = DEFAULT_ZONE_ID,
    private val maxTrackedIps: Long = DEFAULT_MAX_TRACKED_IPS,
    private val clock: () -> Long = { System.currentTimeMillis() }
) {
    @Autowired
    constructor(
        @Value("\${sms.rate-limit.enabled:true}") enabled: Boolean,
        @Value("\${sms.rate-limit.hourly-limit:5}") hourlyLimit: Int,
        @Value("\${sms.rate-limit.daily-limit:20}") dailyLimit: Int,
        @Value("\${sms.rate-limit.window-millis:3600000}") windowMillis: Long,
        @Value("\${sms.rate-limit.timezone:Asia/Shanghai}") timezone: String
    ) : this(
        enabled = enabled,
        hourlyLimit = hourlyLimit,
        dailyLimit = dailyLimit,
        windowMillis = windowMillis,
        zoneId = ZoneId.of(timezone),
        maxTrackedIps = DEFAULT_MAX_TRACKED_IPS,
        clock = { System.currentTimeMillis() }
    )

    private val log = LoggerFactory.getLogger(javaClass)

    private class IpRateState(
        val hourlyTimestamps: ArrayDeque<Long> = ArrayDeque(),
        var day: LocalDate? = null,
        var dailyCount: Int = 0
    )

    private val cache: Cache<String, IpRateState> = Caffeine.newBuilder()
        .expireAfterAccess(25, TimeUnit.HOURS)
        .maximumSize(maxTrackedIps)
        .build()

    fun checkAndRecord(ip: String) {
        if (!enabled) return
        val now = clock()
        val today = LocalDate.ofInstant(Instant.ofEpochMilli(now), zoneId)

        var rejection: TooManyRequestsException? = null
        var logReason: String? = null

        cache.asMap().compute(ip) { _, existing ->
            val state = existing ?: IpRateState()

            val cutoff = now - windowMillis
            while (state.hourlyTimestamps.isNotEmpty() && state.hourlyTimestamps.first() <= cutoff) {
                state.hourlyTimestamps.removeFirst()
            }

            if (hourlyLimit <= 0) {
                val retrySec = (windowMillis / 1000L).coerceAtLeast(1L)
                logReason = "hourly limit=$hourlyLimit"
                rejection = TooManyRequestsException("发送过于频繁，请 ${retrySec} 秒后再试", retrySec)
                return@compute state
            }

            if (state.hourlyTimestamps.size >= hourlyLimit) {
                val retrySec = hourlyRetryAfterSeconds(state.hourlyTimestamps.first(), now)
                logReason = "hourly limit=${state.hourlyTimestamps.size}/$hourlyLimit"
                rejection = TooManyRequestsException("发送过于频繁，请 ${retrySec} 秒后再试", retrySec)
                return@compute state
            }

            if (state.day != today) {
                state.day = today
                state.dailyCount = 0
            }

            if (dailyLimit <= 0 || state.dailyCount >= dailyLimit) {
                val retrySec = secondsUntilNextMidnight(now, today)
                logReason = "daily quota=${state.dailyCount}/$dailyLimit"
                rejection = TooManyRequestsException("今日短信发送次数已达上限，请明天再试", retrySec)
                return@compute state
            }

            state.hourlyTimestamps.addLast(now)
            state.dailyCount++
            state
        }

        rejection?.let { ex ->
            log.warn("SMS rate limit hit for ip={}: {}", ip, logReason)
            throw ex
        }
    }

    private fun hourlyRetryAfterSeconds(oldestTimestamp: Long, nowMillis: Long): Long {
        val remainingMillis = oldestTimestamp + windowMillis - nowMillis
        return (remainingMillis / 1000L).coerceAtLeast(1L)
    }

    private fun secondsUntilNextMidnight(nowMillis: Long, today: LocalDate): Long {
        val nextMidnight = today.plusDays(1).atStartOfDay(zoneId).toInstant()
        return Duration.between(Instant.ofEpochMilli(nowMillis), nextMidnight).seconds.coerceAtLeast(1L)
    }

    internal fun trackedIpCount(): Long {
        cache.cleanUp()
        return cache.estimatedSize()
    }

    fun clearForTesting() {
        cache.invalidateAll()
    }

    companion object {
        private const val DEFAULT_MAX_TRACKED_IPS = 50_000L
        private val DEFAULT_ZONE_ID: ZoneId = ZoneId.of("Asia/Shanghai")
    }
}
