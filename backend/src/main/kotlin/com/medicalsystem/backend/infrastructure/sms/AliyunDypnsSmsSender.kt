package com.medicalsystem.backend.infrastructure.sms

import com.aliyun.dypnsapi20170525.Client
import com.aliyun.dypnsapi20170525.models.SendSmsVerifyCodeRequest
import com.aliyun.dypnsapi20170525.models.SendSmsVerifyCodeResponse
import com.aliyun.teaopenapi.models.Config
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.service.sms.SmsSendResult
import com.medicalsystem.backend.service.sms.SmsSender
import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty
import org.springframework.stereotype.Component

/**
 * Alibaba Cloud DYPNS (Number Verification Service) SMS sender implementation.
 */
@Component
@ConditionalOnProperty(prefix = "aliyun.sms", name = ["enabled"], havingValue = "true")
@ConditionalOnProperty(prefix = "aliyun.sms", name = ["provider"], havingValue = "dypns")
class AliyunDypnsSmsSender internal constructor(
    private val properties: AliyunSmsProperties,
    private val sendFn: (SendSmsVerifyCodeRequest) -> SendSmsVerifyCodeResponse
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
            "[SMS INITIALIZED] Aliyun DYPNS active (AccessKeyId={}, SignName={}, TemplateCode={}, SchemeName={})",
            SmsLogMasking.maskAccessKey(properties.accessKeyId),
            properties.effectiveSignName(),
            properties.templateCode,
            properties.effectiveSchemeName().ifBlank { "(default)" }
        )
    }

    override fun sendVerificationCode(phone: MobileNumber, code: String): SmsSendResult {
        val maskedPhone = SmsLogMasking.maskPhone(phone.value)
        return try {
            val request = SendSmsVerifyCodeRequest().apply {
                phoneNumber = phone.value
                val resolvedScheme = properties.effectiveSchemeName()
                if (resolvedScheme.isNotBlank()) {
                    schemeName = resolvedScheme
                }
                templateParam = "{\"code\":\"$code\",\"min\":\"5\"}"
                codeLength = 6L
                validTime = 300L
                val resolvedSign = properties.effectiveSignName()
                if (resolvedSign.isNotBlank()) {
                    signName = resolvedSign
                }
                if (properties.templateCode.isNotBlank()) {
                    templateCode = properties.templateCode
                }
            }
            val response = sendFn(request)
            val body = response.body
            if (body != null && ("OK".equals(body.code, ignoreCase = true) || "Success".equals(body.code, ignoreCase = true) || body.success == true)) {
                val messageId = body.model?.bizId ?: body.model?.outId ?: body.requestId
                log.info("Alibaba DYPNS SMS delivered successfully to {}", maskedPhone)
                SmsSendResult(success = true, messageId = messageId)
            } else {
                val errorCode = body?.code ?: "UNKNOWN_ERROR"
                val errorMsg = body?.message ?: "SMS dispatch failed"
                log.error("Alibaba DYPNS SMS failed for {}: {} - {}", maskedPhone, errorCode, errorMsg)
                SmsSendResult(success = false, errorCode = errorCode, errorMessage = errorMsg)
            }
        } catch (ex: Exception) {
            log.error("Alibaba DYPNS SMS client exception for {}", maskedPhone, ex)
            SmsSendResult(success = false, errorCode = "CLIENT_EXCEPTION", errorMessage = ex.message)
        }
    }

    companion object {
        internal fun resolveEndpoint(configuredEndpoint: String): String {
            return if (configuredEndpoint.isNotBlank() && configuredEndpoint != "dysmsapi.aliyuncs.com") {
                configuredEndpoint
            } else {
                "dypnsapi.aliyuncs.com"
            }
        }

        private fun createDefaultSendFn(properties: AliyunSmsProperties): (SendSmsVerifyCodeRequest) -> SendSmsVerifyCodeResponse {
            val client by lazy {
                val config = Config().apply {
                    accessKeyId = properties.accessKeyId
                    accessKeySecret = properties.accessKeySecret
                    endpoint = resolveEndpoint(properties.endpoint)
                }
                Client(config)
            }
            return { request -> client.sendSmsVerifyCode(request) }
        }
    }
}
