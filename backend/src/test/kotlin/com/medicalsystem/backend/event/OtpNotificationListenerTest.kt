package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.OtpCode
import com.medicalsystem.backend.port.EmailSenderPort
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.verify

@ExtendWith(MockitoExtension::class)
class OtpNotificationListenerTest {

    @Mock
    private lateinit var emailSenderPort: EmailSenderPort

    private lateinit var listener: OtpNotificationListener

    @BeforeEach
    fun setUp() {
        listener = OtpNotificationListener(emailSenderPort)
    }

    @Test
    fun `onOtpChallengeIssued delegates to EmailSenderPort`() {
        val event = OtpChallengeIssuedEvent(
            email = EmailAddress("teacher@csu.edu.cn"),
            code = OtpCode("123456"),
            expiresInMinutes = 5
        )

        listener.onOtpChallengeIssued(event)

        verify(emailSenderPort).sendOtpVerification(
            recipient = EmailAddress("teacher@csu.edu.cn"),
            code = OtpCode("123456"),
            expiresInMinutes = 5
        )
    }
}
