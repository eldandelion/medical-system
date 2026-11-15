package com.medicalsystem.backend.infrastructure.sms

import com.aliyun.dysmsapi20170525.Client
import com.aliyun.dysmsapi20170525.models.SendSmsRequest
import com.aliyun.dysmsapi20170525.models.SendSmsResponse
import com.aliyun.teaopenapi.models.Config
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.service.sms.SmsSendResult
import com.medicalsystem.backend.service.sms.SmsSender
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

@Component
@ConditionalOnProperty(prefix = "aliyun.sms", name = ["enabled"], havingValue = "true")
@ConditionalOnProperty(prefix = "aliyun.sms", name = ["provider"], havingValue = "dysms", matchIfMissing = true)
class AliyunSmsSender internal constructor(
    private val properties: AliyunSmsProperties,
    private val sendFn: (SendSmsRequest) -> SendSmsResponse
) : SmsSender {
    private val log = LoggerFactory.getLogger(javaClass)

    @Autowired
    constructor(properties: AliyunSmsProperties) : this(
        properties = properties,
        sendFn = createDefaultSendFn(properties)
    )

    @PostConstruct
    fun init() {
        log.info(
            "[SMS INITIALIZED] Aliyun DYSMS active (AccessKeyId={}, SignName={}, TemplateCode={})",
            SmsLogMasking.maskAccessKey(properties.accessKeyId),
            properties.effectiveSignName(),
            properties.templateCode
        )
    }

    override fun sendVerificationCode(phone: MobileNumber, code: String): SmsSendResult {
        val maskedPhone = SmsLogMasking.maskPhone(phone.value)
        return try {
            val request = SendSmsRequest().apply {
                phoneNumbers = phone.value
                signName = properties.effectiveSignName()
                templateCode = properties.templateCode
                templateParam = "{\"code\":\"$code\"}"
            }
            val response = sendFn(request)
            val body = response.body
            if (body != null && "OK".equals(body.code, ignoreCase = true)) {
                SmsSendResult(success = true, messageId = body.bizId)
            } else {
                log.error("Aliyun SMS failed for {}: Code={}, Message={}", maskedPhone, body?.code, body?.message)
                SmsSendResult(
                    success = false,
                    errorCode = body?.code ?: "UNKNOWN_ERROR",
                    errorMessage = body?.message ?: "SMS dispatch failed"
                )
            }
        } catch (e: Exception) {
            log.error("Exception sending SMS to {}: {}", maskedPhone, e.message, e)
            SmsSendResult(success = false, errorCode = "CLIENT_EXCEPTION", errorMessage = e.message)
        }
    }

    companion object {
        private fun createDefaultSendFn(properties: AliyunSmsProperties): (SendSmsRequest) -> SendSmsResponse {
            val client by lazy {
                val config = Config().apply {
                    accessKeyId = properties.accessKeyId
                    accessKeySecret = properties.accessKeySecret
                    endpoint = properties.endpoint.ifBlank { "dysmsapi.aliyuncs.com" }
                }
                Client(config)
            }
            return { request -> client.sendSms(request) }
        }
    }
}
