package com.medicalsystem.backend.service

import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.infrastructure.sms.MockSmsSender
import com.medicalsystem.backend.model.MobileNumber
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class OtpServiceTest {

    private lateinit var mockSmsSender: MockSmsSender
    private lateinit var otpService: OtpService

    @BeforeEach
    fun setUp() {
        mockSmsSender = MockSmsSender()
        otpService = OtpService(mockSmsSender)
        otpService.clearAllForTesting()
    }

    @Test
    fun `testSendOtp_ReturnsDevCodeInMockMode`() {
        val phone = MobileNumber("13812345678")
        val outcome = otpService.sendOtp(phone, OtpPurpose.REGISTRATION)

        assertEquals(300, outcome.expiresInSeconds)
        assertNotNull(outcome.devCode, "devCode should be returned when MockSmsSender is active")
        assertEquals(6, outcome.devCode?.length)
    }

    @Test
    fun `testSendOtp_CooldownEnforced`() {
        val phone = MobileNumber("13812345678")
        otpService.sendOtp(phone, OtpPurpose.REGISTRATION)

        val ex = assertThrows<ValidationException> {
            otpService.sendOtp(phone, OtpPurpose.REGISTRATION)
        }
        assertTrue(ex.message!!.contains("短信发送过于频繁"))
    }

    @Test
    fun `testVerifyOtp_ValidCode`() {
        val phone = MobileNumber("13812345678")
        val outcome = otpService.sendOtp(phone, OtpPurpose.REGISTRATION)
        val code = outcome.devCode!!

        val isValid = otpService.verifyOtp(phone, code, OtpPurpose.REGISTRATION, consume = true)
        assertTrue(isValid)

        // Attempting to reuse consumed OTP should fail
        val ex = assertThrows<ValidationException> {
            otpService.verifyOtp(phone, code, OtpPurpose.REGISTRATION, consume = false)
        }
        assertTrue(ex.message!!.contains("验证码不存在或已过期"))
    }

    @Test
    fun `testVerifyOtp_ExpiredOrInvalid`() {
        val phone = MobileNumber("13812345678")
        otpService.sendOtp(phone, OtpPurpose.REGISTRATION)

        // 1-4 invalid attempts
        for (attempt in 1..4) {
            val ex = assertThrows<ValidationException> {
                otpService.verifyOtp(phone, "000000", OtpPurpose.REGISTRATION, consume = false)
            }
            assertTrue(ex.message!!.contains("验证码错误"))
        }

        // 5th invalid attempt should lock and invalidate the OTP
        val lockEx = assertThrows<ValidationException> {
            otpService.verifyOtp(phone, "000000", OtpPurpose.REGISTRATION, consume = false)
        }
        assertTrue(lockEx.message!!.contains("已被作废"))
    }
}
