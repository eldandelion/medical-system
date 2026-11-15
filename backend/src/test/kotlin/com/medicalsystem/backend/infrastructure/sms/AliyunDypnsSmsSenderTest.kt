package com.medicalsystem.backend.infrastructure.sms

import com.aliyun.dysmsapi20170525.models.SendSmsRequest
import com.aliyun.dysmsapi20170525.models.SendSmsResponse
import com.aliyun.dysmsapi20170525.models.SendSmsResponseBody
import com.aliyun.dypnsapi20170525.models.SendSmsVerifyCodeRequest
import com.aliyun.dypnsapi20170525.models.SendSmsVerifyCodeResponse
import com.aliyun.dypnsapi20170525.models.SendSmsVerifyCodeResponseBody
import com.medicalsystem.backend.model.MobileNumber
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertFalse
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test

class AliyunDypnsSmsSenderTest {

    @Test
    fun `resolveEndpoint falls back to dypnsapi when dysms default or blank`() {
        assertEquals("dypnsapi.aliyuncs.com", AliyunDypnsSmsSender.resolveEndpoint(""))
        assertEquals("dypnsapi.aliyuncs.com", AliyunDypnsSmsSender.resolveEndpoint("dysmsapi.aliyuncs.com"))
        assertEquals("dypnsapi.cn-hangzhou.aliyuncs.com", AliyunDypnsSmsSender.resolveEndpoint("dypnsapi.cn-hangzhou.aliyuncs.com"))
    }

    @Test
    fun `sendVerificationCode sends expected DYPNS request and handles OK response`() {
        var captured: SendSmsVerifyCodeRequest? = null

        val body = SendSmsVerifyCodeResponseBody().apply {
            code = "OK"
            success = true
            requestId = "req-1"
            model = SendSmsVerifyCodeResponseBody.SendSmsVerifyCodeResponseBodyModel().apply {
                bizId = "biz-123"
            }
        }
        val properties = AliyunSmsProperties(
            enabled = true,
            provider = SmsProviderType.DYPNS,
            signName = "TestSign",
            templateCode = "100001",
            schemeCode = "FC1000"
        )
        val sender = AliyunDypnsSmsSender(properties) { request ->
            captured = request
            SendSmsVerifyCodeResponse().apply { setBody(body) }
        }

        val result = sender.sendVerificationCode(MobileNumber("13800138000"), "654321")

        assertTrue(result.success)
        assertEquals("biz-123", result.messageId)

        assertNotNull(captured)
        assertEquals("13800138000", captured!!.phoneNumber)
        assertEquals("TestSign", captured!!.signName)
        assertEquals("100001", captured!!.templateCode)
        assertEquals("FC1000", captured!!.schemeName)
        assertEquals("{\"code\":\"654321\",\"min\":\"5\"}", captured!!.templateParam)
        assertEquals(6L, captured!!.codeLength)
        assertEquals(300L, captured!!.validTime)
    }

    @Test
    fun `sendVerificationCode returns failure result on gateway error body`() {
        val body = SendSmsVerifyCodeResponseBody().apply {
            code = "isv.BUSINESS_LIMIT_CONTROL"
            message = "Frequency limit exceeded"
            success = false
        }

        val sender = AliyunDypnsSmsSender(AliyunSmsProperties(enabled = true, provider = SmsProviderType.DYPNS)) {
            SendSmsVerifyCodeResponse().apply { setBody(body) }
        }
        val result = sender.sendVerificationCode(MobileNumber("13800138000"), "123456")

        assertFalse(result.success)
        assertEquals("isv.BUSINESS_LIMIT_CONTROL", result.errorCode)
        assertEquals("Frequency limit exceeded", result.errorMessage)
    }

    @Test
    fun `sendVerificationCode returns failure result on client exception`() {
        val sender = AliyunDypnsSmsSender(AliyunSmsProperties(enabled = true, provider = SmsProviderType.DYPNS)) {
            throw RuntimeException("Network timeout")
        }
        val result = sender.sendVerificationCode(MobileNumber("13800138000"), "123456")

        assertFalse(result.success)
        assertEquals("CLIENT_EXCEPTION", result.errorCode)
        assertEquals("Network timeout", result.errorMessage)
    }

    @Test
    fun `AliyunSmsSender (DYSMS) sends expected request and maps errors cleanly`() {
        var captured: SendSmsRequest? = null
        val okSender = AliyunSmsSender(
            AliyunSmsProperties(
                enabled = true,
                provider = SmsProviderType.DYSMS,
                signName = "SignA",
                templateCode = "SMS_001"
            )
        ) { req ->
            captured = req
            SendSmsResponse().apply {
                setBody(SendSmsResponseBody().apply {
                    code = "OK"
                    bizId = "dysms-biz-1"
                })
            }
        }

        val okResult = okSender.sendVerificationCode(MobileNumber("13800138000"), "112233")
        assertTrue(okResult.success)
        assertEquals("dysms-biz-1", okResult.messageId)
        assertEquals("13800138000", captured?.phoneNumbers)
        assertEquals("SignA", captured?.signName)
        assertEquals("SMS_001", captured?.templateCode)
        assertEquals("{\"code\":\"112233\"}", captured?.templateParam)
    }
}
