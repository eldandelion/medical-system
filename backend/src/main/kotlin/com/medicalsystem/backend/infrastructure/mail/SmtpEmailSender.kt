package com.medicalsystem.backend.infrastructure.mail

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.OtpCode
import com.medicalsystem.backend.port.EmailSenderPort
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.ObjectProvider
import org.springframework.beans.factory.annotation.Value
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component

@Component
class SmtpEmailSender(
    private val mailSenderProvider: ObjectProvider<JavaMailSender>,
    @Value("\${spring.mail.username:}") private val fromAddress: String
) : EmailSenderPort {

    private val logger = LoggerFactory.getLogger(SmtpEmailSender::class.java)

    @Async("mailTaskExecutor")
    override fun sendOtpVerification(recipient: EmailAddress, code: OtpCode, expiresInMinutes: Long) {
        val mailSender = mailSenderProvider.ifAvailable
        if (mailSender != null && fromAddress.isNotBlank()) {
            try {
                logger.info("Dispatching verification email to {} via SMTP (sender={})", recipient.value, fromAddress)

                val message = SimpleMailMessage().apply {
                    from = fromAddress
                    setTo(recipient.value)
                    subject = "【中南大学医疗筛查系统】注册验证码"
                    text = """
                        尊敬的用户：

                        您好！您正在进行【中南大学医疗筛查与转诊系统】教职工账号注册。

                        您的注册验证码为：${code.value}

                        该验证码在 ${expiresInMinutes} 分钟内有效，请尽快完成验证。
                        如非本人操作，请忽略此邮件。

                        --------------------------------------------------
                        中南大学学生心理健康教育与咨询中心 / 医疗筛查平台
                    """.trimIndent()
                }

                mailSender.send(message)
                logger.info("Successfully delivered verification email to {}", recipient.value)
            } catch (ex: Exception) {
                logger.error("Failed to deliver email to {} via SMTP: {}", recipient.value, ex.message, ex)
            }
        } else {
            logger.info(
                """
                ================================================================================
                [DEV EMAIL DISPATCH - NO SMTP CONFIGURED]
                Recipient: {}
                Subject:   【中南大学医疗筛查系统】注册验证码
                OTP Code:  {}
                Expires:   {} minutes
                ================================================================================
                """.trimIndent(),
                recipient.value, code.value, expiresInMinutes
            )
        }
    }
}
