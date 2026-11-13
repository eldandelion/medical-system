package com.medicalsystem.backend.infrastructure.sms

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class SmsConfigValidatorTest {

    private fun properties(
        enabled: Boolean = false,
        accessKeyId: String = "",
        accessKeySecret: String = "",
        signName: String = "",
        templateCode: String = ""
    ) = AliyunSmsProperties(
        enabled = enabled,
        accessKeyId = accessKeyId,
        accessKeySecret = accessKeySecret,
        signName = signName,
        templateCode = templateCode
    )

    @Test
    fun `disabled config never throws even with blank keys`() {
        val validator = SmsConfigValidator(properties(enabled = false))
        assertDoesNotThrow { validator.validate() }
    }

    @Test
    fun `fully configured enabled config passes`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                accessKeyId = "ak",
                accessKeySecret = "sk",
                signName = "签名",
                templateCode = "SMS_123"
            )
        )
        assertDoesNotThrow { validator.validate() }
    }

    @Test
    fun `enabled with missing access key id fails fast`() {
        val validator = SmsConfigValidator(
            properties(enabled = true, accessKeySecret = "sk", signName = "签名", templateCode = "SMS_123")
        )
        val ex = assertThrows<IllegalStateException> { validator.validate() }
        assertTrue(ex.message!!.contains("aliyun.sms.access-key-id"))
    }

    @Test
    fun `enabled with missing sign name fails fast`() {
        val validator = SmsConfigValidator(
            properties(enabled = true, accessKeyId = "ak", accessKeySecret = "sk", templateCode = "SMS_123")
        )
        val ex = assertThrows<IllegalStateException> { validator.validate() }
        assertTrue(ex.message!!.contains("aliyun.sms.sign-name"))
    }

    @Test
    fun `enabled with missing template code fails fast`() {
        val validator = SmsConfigValidator(
            properties(enabled = true, accessKeyId = "ak", accessKeySecret = "sk", signName = "签名")
        )
        val ex = assertThrows<IllegalStateException> { validator.validate() }
        assertTrue(ex.message!!.contains("aliyun.sms.template-code"))
    }
}
