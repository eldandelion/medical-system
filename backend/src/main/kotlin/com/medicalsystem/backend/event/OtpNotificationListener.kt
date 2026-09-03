package com.medicalsystem.backend.event

import com.medicalsystem.backend.port.EmailSenderPort
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component

@Component
class OtpNotificationListener(
    private val emailSenderPort: EmailSenderPort
) {
    @EventListener
    fun onOtpChallengeIssued(event: OtpChallengeIssuedEvent) {
        emailSenderPort.sendOtpVerification(event.email, event.code, event.expiresInMinutes)
    }
}
