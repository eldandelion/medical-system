package com.medicalsystem.backend.service

import com.medicalsystem.backend.infrastructure.sms.MockSmsSender
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.service.sms.SmsSendResult
import com.medicalsystem.backend.service.sms.SmsSender
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test

/**
 * devCode-exposure rule: the OTP code may only be surfaced as `devCode` in the
 * send-code response when the active SmsSender is the MockSmsSender. With any real
 * provider configured, devCode MUST be null so codes never leak through the API.
 *
 * Uses a hand-rolled fake (not Mockito) because SmsSender's parameter is a Kotlin
 * value class, which Mockito matchers cannot handle.
 */
class OtpDevCodeExposureTest {

    /** Any non-MockSmsSender sender stands in for a real provider (AliyunSmsSender). */
    private class RealProviderFake : SmsSender {
        override fun sendVerificationCode(phone: MobileNumber, code: String): SmsSendResult =
            SmsSendResult(success = true, messageId = "real-1")
    }

    @Test
    fun `devCode is null with a non-mock sender even on successful send`() {
        val otpService = OtpService(RealProviderFake())

        val outcome = otpService.sendOtp(MobileNumber("13811112222"), OtpPurpose.LOGIN)

        assertNotNull(outcome)
        assertEquals(300, outcome.expiresInSeconds)
        assertNull(outcome.devCode, "devCode must never be populated when a real SMS provider is active")
    }

    @Test
    fun `devCode is populated with MockSmsSender`() {
        val mockService = OtpService(MockSmsSender())

        val outcome = mockService.sendOtp(MobileNumber("13811113333"), OtpPurpose.LOGIN)

        assertNotNull(outcome.devCode, "devCode is expected in mock mode for local development")
        assertEquals(6, outcome.devCode!!.length)
    }
}
