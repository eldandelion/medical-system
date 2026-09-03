package com.medicalsystem.backend.infrastructure.mail

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.OtpCode
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import org.springframework.beans.factory.ObjectProvider
import org.springframework.mail.SimpleMailMessage
import org.springframework.mail.javamail.JavaMailSender

@ExtendWith(MockitoExtension::class)
class SmtpEmailSenderTest {

    @Mock
    private lateinit var mailSenderProvider: ObjectProvider<JavaMailSender>

    @Mock
    private lateinit var mailSender: JavaMailSender

    private lateinit var smtpEmailSender: SmtpEmailSender

    private val fromAddress = "daniellane@qq.com"

    @BeforeEach
    fun setUp() {
        smtpEmailSender = SmtpEmailSender(mailSenderProvider, fromAddress)
    }

    @Test
    fun `sendOtpVerification sends formatted SimpleMailMessage via JavaMailSender when available`() {
        whenever(mailSenderProvider.ifAvailable).thenReturn(mailSender)

        val recipient = EmailAddress("doctor@csu.edu.cn")
        val code = OtpCode("654321")
        val expiresIn = 5L

        smtpEmailSender.sendOtpVerification(recipient, code, expiresIn)

        val captor = ArgumentCaptor.forClass(SimpleMailMessage::class.java)
        verify(mailSender).send(captor.capture())

        val message = captor.value
        assertEquals(fromAddress, message.from)
        assertArrayEquals(arrayOf("doctor@csu.edu.cn"), message.to)
        assertTrue(message.subject!!.contains("注册验证码"))
        assertTrue(message.text!!.contains("654321"))
        assertTrue(message.text!!.contains("5"))
    }

    @Test
    fun `sendOtpVerification falls back to logging when JavaMailSender is absent`() {
        whenever(mailSenderProvider.ifAvailable).thenReturn(null)

        val recipient = EmailAddress("doctor@csu.edu.cn")
        val code = OtpCode("654321")
        val expiresIn = 5L

        assertDoesNotThrow {
            smtpEmailSender.sendOtpVerification(recipient, code, expiresIn)
        }
    }
}
