package com.medicalsystem.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.medicalsystem.backend.dto.LoginSmsRequest
import com.medicalsystem.backend.dto.SendCodeRequest
import com.medicalsystem.backend.dto.VerifyCodeRequest
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.exception.GlobalExceptionHandler
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.CollegeJpaRepository
import com.medicalsystem.backend.repository.MajorJpaRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import com.medicalsystem.backend.service.OtpPurpose
import com.medicalsystem.backend.service.OtpService
import com.medicalsystem.backend.service.sms.SmsRateLimitService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.util.concurrent.atomic.AtomicLong

/**
 * Controller-level tests for the SMS OTP endpoints:
 * POST /api/auth/send-code, /api/auth/verify-code, /api/auth/login-sms.
 *
 * Covers success paths, the 60s send cooldown, 5-attempt lockout, the per-IP
 * send-code rate limit (429), and the devCode-exposure rule (devCode present in
 * mock mode; the real-provider counterpart is OtpDevCodeExposureTest).
 *
 * Uses the same Spring context configuration as StudentAuthControllerTest so the
 * cached context is reused; MockSmsSender is active in tests, so no real SMS is sent.
 */
@SpringBootTest(properties = ["SEED_DEMO_DATA=true", "spring.datasource.url=jdbc:h2:mem:auth_seed_test;DB_CLOSE_DELAY=-1"])
@Transactional
class SmsAuthControllerTest {

    @Autowired
    private lateinit var authController: AuthController

    @Autowired
    private lateinit var otpService: OtpService

    @Autowired
    private lateinit var smsRateLimitService: SmsRateLimitService

    @Autowired
    private lateinit var userJpaRepository: UserJpaRepository

    @Autowired
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Autowired
    private lateinit var collegeJpaRepository: CollegeJpaRepository

    @Autowired
    private lateinit var majorJpaRepository: MajorJpaRepository

    private lateinit var mockMvc: MockMvc
    private val objectMapper = ObjectMapper()

    private val phoneSeq = AtomicLong(137_0000_0000L)

    private fun nextPhone(): String = phoneSeq.incrementAndGet().toString()

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
        otpService.clearAllForTesting()
        smsRateLimitService.clearForTesting()
    }

    private fun sendCode(phone: String, purpose: String = "REGISTRATION") =
        mockMvc.perform(
            post("/api/auth/send-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(SendCodeRequest(phone = phone, purpose = purpose)))
        )

    private fun verifyCode(phone: String, code: String, purpose: String = "REGISTRATION") =
        mockMvc.perform(
            post("/api/auth/verify-code")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(VerifyCodeRequest(phone = phone, code = code, purpose = purpose)))
        )

    private fun loginSms(phone: String, code: String) =
        mockMvc.perform(
            post("/api/auth/login-sms")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(LoginSmsRequest(phone = phone, code = code)))
        )

    private fun createStudentUser(phone: String, suffix: Long): UserEntity {
        val college = collegeJpaRepository.findAll().firstOrNull()
            ?: collegeJpaRepository.save(CollegeEntity(name = "短信测试学院$suffix"))
        val major = majorJpaRepository.findAll().firstOrNull()
            ?: majorJpaRepository.save(MajorEntity(name = "短信测试专业$suffix", college = college))

        val user = userJpaRepository.save(
            UserEntity(
                name = "短信用户$suffix",
                role = UserRole.STUDENT,
                email = EmailAddress("sms-test-$suffix@univ.edu.cn"),
                status = AccountStatus.ACTIVE,
                phone = phone
            )
        )
        studentJpaRepository.save(
            StudentEntity(
                id = user.id,
                studentNumber = "SMS_$suffix",
                name = "短信用户$suffix",
                major = major,
                enrollmentDate = LocalDate.of(2024, 9, 1)
            )
        )
        return user
    }

    // ------------------------------------------------------------------
    // send-code
    // ------------------------------------------------------------------

    @Test
    fun `sendCode returns 200 with devCode in mock mode`() {
        val phone = nextPhone()

        val result = sendCode(phone)

        result.andExpect(status().isOk)
            .andExpect(jsonPath("$.phone").value(phone))
            .andExpect(jsonPath("$.devCode").isNotEmpty)
            .andExpect(jsonPath("$.expiresInSeconds").value(300))

        val body = objectMapper.readTree(result.andReturn().response.contentAsString)
        assertEquals(6, body.get("devCode").asText().length)
    }

    @Test
    fun `sendCode with login purpose for unregistered phone returns 404`() {
        val phone = nextPhone()

        sendCode(phone, purpose = "LOGIN")
            .andExpect(status().isNotFound) // NotFoundException -> @ResponseStatus, empty body under standalone MockMvc
    }

    @Test
    fun `sendCode twice within cooldown returns 400 with wait message`() {
        val phone = nextPhone()

        sendCode(phone).andExpect(status().isOk)

        val result = sendCode(phone)
        result.andExpect(status().isBadRequest)
        val error = objectMapper.readTree(result.andReturn().response.contentAsString).get("error").asText()
        assertTrue(error.contains("等待"), "cooldown error should mention remaining seconds, got: $error")
    }

    @Test
    fun `sendCode returns 429 after hourly per-ip limit is exhausted`() {
        // 5 successful sends with distinct phones (each recorded against the same IP)
        repeat(5) { sendCode(nextPhone()).andExpect(status().isOk) }

        // 6th request within the hour is rejected with 429 before any SMS logic runs
        sendCode(nextPhone())
            .andExpect(status().isTooManyRequests)
            .andExpect(jsonPath("$.error").value(org.hamcrest.Matchers.containsString("发送过于频繁")))
    }

    // ------------------------------------------------------------------
    // verify-code
    // ------------------------------------------------------------------

    @Test
    fun `verifyCode with correct code returns valid true`() {
        val phone = nextPhone()
        val devCode = sendCode(phone).andReturn().let {
            objectMapper.readTree(it.response.contentAsString).get("devCode").asText()
        }

        verifyCode(phone, devCode).andExpect(status().isOk).andExpect(jsonPath("$.valid").value(true))
    }

    @Test
    fun `verifyCode locks record after five wrong attempts`() {
        val phone = nextPhone()
        val devCode = sendCode(phone).andReturn().let {
            objectMapper.readTree(it.response.contentAsString).get("devCode").asText()
        }

        // Attempts 1-4: decreasing remaining attempts
        for (remaining in 4 downTo 1) {
            val result = verifyCode(phone, "000000")
            result.andExpect(status().isBadRequest)
            val error = objectMapper.readTree(result.andReturn().response.contentAsString).get("error").asText()
            assertTrue(error.contains("还剩 $remaining 次"), "attempt should report $remaining remaining, got: $error")
        }

        // 5th wrong attempt invalidates the record
        verifyCode(phone, "000000")
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("验证码错误次数过多，已被作废，请重新获取"))

        // Even the correct code is now rejected: the record is gone
        verifyCode(phone, devCode)
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("验证码不存在或已过期，请重新获取"))
    }

    // ------------------------------------------------------------------
    // login-sms
    // ------------------------------------------------------------------

    @Test
    fun `loginSms with correct code returns token and role`() {
        val suffix = phoneSeq.incrementAndGet()
        val phone = nextPhone()
        createStudentUser(phone, suffix)

        val devCode = sendCode(phone, purpose = "LOGIN").andReturn().let {
            objectMapper.readTree(it.response.contentAsString).get("devCode").asText()
        }

        loginSms(phone, devCode)
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").isNotEmpty)
            .andExpect(jsonPath("$.role").value("STUDENT"))
    }

    @Test
    fun `loginSms consumes the code so it cannot be reused`() {
        val suffix = phoneSeq.incrementAndGet()
        val phone = nextPhone()
        createStudentUser(phone, suffix)

        val devCode = sendCode(phone, purpose = "LOGIN").andReturn().let {
            objectMapper.readTree(it.response.contentAsString).get("devCode").asText()
        }

        loginSms(phone, devCode).andExpect(status().isOk)
        loginSms(phone, devCode).andExpect(status().isBadRequest)
    }

    @Test
    fun `loginSms with wrong code returns 400`() {
        val suffix = phoneSeq.incrementAndGet()
        val phone = nextPhone()
        createStudentUser(phone, suffix)

        sendCode(phone, purpose = "LOGIN").andExpect(status().isOk)

        loginSms(phone, "000000")
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("验证码错误，还剩 4 次尝试机会"))
    }

    @Test
    fun `loginSms for unregistered phone with valid code returns 404`() {
        val phone = nextPhone()
        // Seed an OTP for a phone that has no user (service call bypasses the controller's
        // registered-user check that send-code applies for LOGIN purpose)
        val devCode = otpService.sendOtp(
            com.medicalsystem.backend.model.MobileNumber(phone),
            OtpPurpose.LOGIN
        ).devCode

        loginSms(phone, devCode!!)
            .andExpect(status().isNotFound)
    }
}
