package com.medicalsystem.backend.infrastructure.sms

import com.medicalsystem.backend.service.sms.SmsSender
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.boot.autoconfigure.AutoConfigurations
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.test.context.runner.ApplicationContextRunner
import org.springframework.context.annotation.Configuration

class SmsConfigurationTest {

    @Configuration
    @EnableConfigurationProperties(AliyunSmsProperties::class)
    class PropertiesTestConfig

    private val contextRunner = ApplicationContextRunner()
        .withConfiguration(
            AutoConfigurations.of(
                PropertiesTestConfig::class.java,
                MockSmsSender::class.java,
                AliyunSmsSender::class.java,
                AliyunDypnsSmsSender::class.java
            )
        )

    @Test
    fun `default configuration activates MockSmsSender`() {
        contextRunner.run { context ->
            val smsSender = context.getBean(SmsSender::class.java)
            assertTrue(smsSender is MockSmsSender)
        }
    }

    @Test
    fun `enabled without provider defaults to AliyunSmsSender (dysms)`() {
        contextRunner
            .withPropertyValues(
                "aliyun.sms.enabled=true",
                "aliyun.sms.access-key-id=test-key-id",
                "aliyun.sms.access-key-secret=test-secret"
            )
            .run { context ->
                val smsSender = context.getBean(SmsSender::class.java)
                assertTrue(smsSender is AliyunSmsSender)
            }
    }

    @Test
    fun `provider dysms activates AliyunSmsSender`() {
        contextRunner
            .withPropertyValues(
                "aliyun.sms.enabled=true",
                "aliyun.sms.provider=dysms",
                "aliyun.sms.access-key-id=test-key-id",
                "aliyun.sms.access-key-secret=test-secret"
            )
            .run { context ->
                val smsSender = context.getBean(SmsSender::class.java)
                assertTrue(smsSender is AliyunSmsSender)
            }
    }

    @Test
    fun `provider dypns activates AliyunDypnsSmsSender`() {
        contextRunner
            .withPropertyValues(
                "aliyun.sms.enabled=true",
                "aliyun.sms.provider=dypns",
                "aliyun.sms.access-key-id=test-key-id",
                "aliyun.sms.access-key-secret=test-secret",
                "aliyun.sms.scheme-code=FC1000000000"
            )
            .run { context ->
                val smsSender = context.getBean(SmsSender::class.java)
                assertTrue(smsSender is AliyunDypnsSmsSender)
            }
    }

    @Test
    fun `AliyunSmsProperties resolves effective scheme name and masks logs`() {
        assertEquals("FC123", AliyunSmsProperties(schemeCode = "FC123").effectiveSchemeName())
        assertEquals("my-scheme", AliyunSmsProperties(schemeName = "my-scheme").effectiveSchemeName())
        assertEquals("preferred", AliyunSmsProperties(schemeName = "preferred", schemeCode = "FC456").effectiveSchemeName())

        assertEquals("LTAI****iH1S", SmsLogMasking.maskAccessKey("LTAI5tTestiH1S"))
        assertEquals("(unset)", SmsLogMasking.maskAccessKey(""))
        assertEquals("138****5678", SmsLogMasking.maskPhone("13812345678"))
    }
}
