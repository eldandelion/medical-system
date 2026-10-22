package com.medicalsystem.backend.infrastructure.sms

import com.aliyun.dysmsapi20170525.Client
import com.aliyun.dysmsapi20170525.models.SendSmsRequest
import com.aliyun.teaopenapi.models.Config
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.service.sms.SmsSendResult
import com.medicalsystem.backend.service.sms.SmsSender
import org.slf4j.LoggerFactory
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "aliyun.sms", name = ["enabled"], havingValue = "true")
class AliyunSmsSender(
    private val properties: AliyunSmsProperties
) : SmsSender {
    private val log = LoggerFactory.getLogger(javaClass)

    private val client: Client by lazy {
        val config = Config().apply {
            accessKeyId = properties.accessKeyId
            accessKeySecret = properties.accessKeySecret
            endpoint = properties.endpoint
        }
        Client(config)
    }

    override fun sendVerificationCode(phone: MobileNumber, code: String): SmsSendResult {
        return try {
            val request = SendSmsRequest().apply {
                phoneNumbers = phone.value
                signName = properties.effectiveSignName()
                templateCode = properties.templateCode
                templateParam = "{\"code\":\"$code\"}"
            }
            val response = client.sendSms(request)
            val body = response.body
            if ("OK".equals(body.code, ignoreCase = true)) {
                SmsSendResult(success = true, messageId = body.bizId)
            } else {
                log.error("Aliyun SMS failed for {}: Code={}, Message={}", phone.value, body.code, body.message)
                SmsSendResult(success = false, errorCode = body.code, errorMessage = body.message)
            }
        } catch (e: Exception) {
            log.error("Exception sending SMS to {}: {}", phone.value, e.message, e)
            SmsSendResult(success = false, errorMessage = e.message)
        }
    }
}
