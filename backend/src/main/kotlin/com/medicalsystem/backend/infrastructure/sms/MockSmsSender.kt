package com.medicalsystem.backend.infrastructure.sms

import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.service.sms.SmsSendResult
import com.medicalsystem.backend.service.sms.SmsSender
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "aliyun.sms", name = ["enabled"], havingValue = "false", matchIfMissing = true)
class MockSmsSender : SmsSender {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun init() {
        log.info("[SMS INITIALIZED] MockSmsSender active (Aliyun SMS is disabled)")
    }

    override fun sendVerificationCode(phone: MobileNumber, code: String): SmsSendResult {
        log.info("[MOCK SMS] Verification code for {}: {}", phone.value, code)
        return SmsSendResult(success = true, messageId = "mock-${System.currentTimeMillis()}")
    }
}
