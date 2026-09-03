package com.medicalsystem.backend.port

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.OtpCode

interface EmailSenderPort {
    fun sendOtpVerification(recipient: EmailAddress, code: OtpCode, expiresInMinutes: Long)
}
