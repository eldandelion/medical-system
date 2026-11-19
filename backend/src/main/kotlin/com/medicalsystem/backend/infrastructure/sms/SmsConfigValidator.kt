package com.medicalsystem.backend.infrastructure.sms

import jakarta.annotation.PostConstruct
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Component

/**
 * Fails fast when Aliyun SMS is enabled but its required credentials/template are not
 * fully configured. Without this, a partially configured deployment would only discover
 * the problem on the first user-facing send-code request.
 *
 * Activation contract:
 * - `aliyun.sms.enabled` false or absent (default) -> MockSmsSender, no keys required.
 * - `aliyun.sms.enabled` true + `provider=dysms` -> `access-key-id`, `access-key-secret`,
 *   `sign-name`, and `template-code` must all be non-blank.
 * - `aliyun.sms.enabled` true + `provider=dypns` -> `access-key-id`, `access-key-secret`,
 *   and either `scheme-name`/`scheme-code` OR both `sign-name` and `template-code` must be non-blank.
 */
@Component
class SmsConfigValidator(
    private val properties: AliyunSmsProperties
) {
    private val log = LoggerFactory.getLogger(javaClass)

    @PostConstruct
    fun validate() {
        if (!properties.enabled) {
            log.info("[SMS CONFIG] Aliyun SMS disabled; MockSmsSender is active")
            return
        }
        val missing = buildList {
            if (properties.accessKeyId.isBlank()) add("aliyun.sms.access-key-id")
            if (properties.accessKeySecret.isBlank()) add("aliyun.sms.access-key-secret")
            when (properties.provider) {
                SmsProviderType.DYSMS -> {
                    if (properties.signName.isBlank()) add("aliyun.sms.sign-name")
                    if (properties.templateCode.isBlank()) add("aliyun.sms.template-code")
                }
                SmsProviderType.DYPNS -> {
                    val hasScheme = properties.effectiveSchemeName().isNotBlank()
                    val hasSignAndTemplate = properties.signName.isNotBlank() && properties.templateCode.isNotBlank()
                    if (!hasScheme && !hasSignAndTemplate) {
                        add("aliyun.sms.scheme-name (or both aliyun.sms.sign-name and aliyun.sms.template-code)")
                    }
                }
            }
        }
        if (missing.isNotEmpty()) {
            throw IllegalStateException(
                "Aliyun SMS (${properties.provider}) is enabled (aliyun.sms.enabled=true) but required configuration is missing: " +
                    missing.joinToString(", ") +
                    ". Set the corresponding ALIYUN_SMS_* / ALIBABA_SMS_* environment variables, or set " +
                    "aliyun.sms.enabled=false to use MockSmsSender."
            )
        }
        log.info(
            "[SMS CONFIG] Aliyun SMS enabled (provider={}, signName='{}', schemeName='{}')",
            properties.provider,
            properties.effectiveSignName(),
            properties.effectiveSchemeName()
        )
    }
}
