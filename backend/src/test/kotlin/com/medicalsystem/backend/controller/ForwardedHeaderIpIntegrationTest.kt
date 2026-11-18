package com.medicalsystem.backend.controller

import com.medicalsystem.backend.service.OtpService
import com.medicalsystem.backend.service.sms.SmsRateLimitService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.http.HttpHeaders
import java.net.URI
import java.net.http.HttpClient
import java.net.http.HttpRequest
import java.net.http.HttpResponse
import java.util.concurrent.atomic.AtomicLong

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = ["SEED_DEMO_DATA=false", "spring.datasource.url=jdbc:h2:mem:forwarded_ip_test;DB_CLOSE_DELAY=-1"]
)
class ForwardedHeaderIpIntegrationTest {

    @LocalServerPort
    private var port: Int = 0

    @Autowired
    private lateinit var otpService: OtpService

    @Autowired
    private lateinit var smsRateLimitService: SmsRateLimitService

    private val client = HttpClient.newHttpClient()
    private val phoneSeq = AtomicLong(136_0000_0000L)

    @BeforeEach
    fun setUp() {
        otpService.clearAllForTesting()
        smsRateLimitService.clearForTesting()
    }

    private fun postSendCode(forwardedFor: String): HttpResponse<String> {
        val phone = phoneSeq.incrementAndGet().toString()
        val request = HttpRequest.newBuilder()
            .uri(URI.create("http://127.0.0.1:$port/api/auth/send-code"))
            .header("Content-Type", "application/json")
            .header("X-Forwarded-For", forwardedFor)
            .POST(HttpRequest.BodyPublishers.ofString("""{"phone":"$phone","purpose":"REGISTRATION"}"""))
            .build()
        return client.send(request, HttpResponse.BodyHandlers.ofString())
    }

    @Test
    fun `spoofed leftmost X-Forwarded-For cannot bypass per-IP rate limit behind trusted proxy`() {
        // Loopback 127.0.0.1 is a trusted internal proxy; Tomcat RemoteIpValve strips right-to-left
        // and resolves client IP as 203.0.113.5, ignoring attacker-controlled leftmost tokens.
        repeat(5) { idx ->
            val res = postSendCode("198.51.100.$idx, 203.0.113.5")
            assertEquals(200, res.statusCode(), "request $idx should succeed, body=${res.body()}")
        }

        val blocked = postSendCode("9.9.9.9, 203.0.113.5")
        assertEquals(429, blocked.statusCode(), "6th request from same real client IP must be rate-limited")
        assertTrue(blocked.headers().firstValue(HttpHeaders.RETRY_AFTER).isPresent)

        // Different downstream client IP behind the same proxy still has its own quota
        val otherClient = postSendCode("9.9.9.9, 203.0.113.6")
        assertEquals(200, otherClient.statusCode())
    }
}
