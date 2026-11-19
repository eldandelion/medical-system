package com.medicalsystem.backend.infrastructure.sms

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class SmsConfigValidatorTest {

    private fun properties(
        enabled: Boolean = false,
        provider: SmsProviderType = SmsProviderType.DYSMS,
        accessKeyId: String = "",
        accessKeySecret: String = "",
        signName: String = "",
        templateCode: String = "",
        schemeName: String = "",
        schemeCode: String = ""
    ) = AliyunSmsProperties(
        enabled = enabled,
        provider = provider,
        accessKeyId = accessKeyId,
        accessKeySecret = accessKeySecret,
        signName = signName,
        templateCode = templateCode,
        schemeName = schemeName,
        schemeCode = schemeCode
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

    @Test
    fun `dysms enabled with schemeCode set but blank signName still fails fast`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                provider = SmsProviderType.DYSMS,
                accessKeyId = "ak",
                accessKeySecret = "sk",
                templateCode = "SMS_123",
                schemeCode = "SCH_1"
            )
        )
        val ex = assertThrows<IllegalStateException> { validator.validate() }
        assertTrue(ex.message!!.contains("aliyun.sms.sign-name"))
    }

    @Test
    fun `dysms enabled with missing accessKeySecret fails fast`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                provider = SmsProviderType.DYSMS,
                accessKeyId = "ak",
                signName = "签名",
                templateCode = "SMS_123"
            )
        )
        val ex = assertThrows<IllegalStateException> { validator.validate() }
        assertTrue(ex.message!!.contains("aliyun.sms.access-key-secret"))
    }

    @Test
    fun `dypns enabled with schemeCode passes without signName or templateCode`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                provider = SmsProviderType.DYPNS,
                accessKeyId = "ak",
                accessKeySecret = "sk",
                schemeCode = "SCH_123"
            )
        )
        assertDoesNotThrow { validator.validate() }
    }

    @Test
    fun `dypns enabled with schemeName passes without schemeCode, signName or templateCode`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                provider = SmsProviderType.DYPNS,
                accessKeyId = "ak",
                accessKeySecret = "sk",
                schemeName = "测试方案"
            )
        )
        assertDoesNotThrow { validator.validate() }
    }

    @Test
    fun `dypns enabled with signName and templateCode passes without schemeName or schemeCode`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                provider = SmsProviderType.DYPNS,
                accessKeyId = "ak",
                accessKeySecret = "sk",
                signName = "签名",
                templateCode = "100001"
            )
        )
        assertDoesNotThrow { validator.validate() }
    }

    @Test
    fun `dypns enabled without scheme and without complete signName plus templateCode fails fast`() {
        val validator = SmsConfigValidator(
            properties(
                enabled = true,
                provider = SmsProviderType.DYPNS,
                accessKeyId = "ak",
                accessKeySecret = "sk",
                signName = "签名"
            )
        )
        val ex = assertThrows<IllegalStateException> { validator.validate() }
        assertTrue(ex.message!!.contains("aliyun.sms.scheme-name"))
    }
}
