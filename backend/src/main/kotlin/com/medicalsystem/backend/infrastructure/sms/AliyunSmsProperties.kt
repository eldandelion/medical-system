package com.medicalsystem.backend.infrastructure.sms

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component

enum class SmsProviderType {
    DYSMS,
    DYPNS
}

@Component
@ConfigurationProperties(prefix = "aliyun.sms")
data class AliyunSmsProperties(
    var enabled: Boolean = false,
    var provider: SmsProviderType = SmsProviderType.DYSMS,
    var accessKeyId: String = "",
    var accessKeySecret: String = "",
    var endpoint: String = "dysmsapi.aliyuncs.com",
    var signName: String = "",
    var templateCode: String = "",
    var schemeName: String = "",
    var schemeCode: String = ""
) {
    fun effectiveSchemeName(): String = schemeName.ifBlank { schemeCode }

    fun effectiveSignName(): String {
        if (signName.isBlank()) return ""
        return try {
            if (signName.any { it.code in 0x0080..0x00FF }) {
                String(signName.toByteArray(Charsets.ISO_8859_1), Charsets.UTF_8)
            } else {
                signName
            }
        } catch (_: Exception) {
            signName
        }
    }
}

internal object SmsLogMasking {
    fun maskAccessKey(accessKeyId: String): String {
        return when {
            accessKeyId.isBlank() -> "(unset)"
            accessKeyId.length > 8 -> "${accessKeyId.take(4)}****${accessKeyId.takeLast(4)}"
            else -> "****"
        }
    }

    fun maskPhone(phone: String): String {
        return when {
            phone.length == 11 -> "${phone.substring(0, 3)}****${phone.substring(7)}"
            phone.length > 4 -> "${phone.take(2)}****${phone.takeLast(2)}"
            else -> "****"
        }
    }
}
