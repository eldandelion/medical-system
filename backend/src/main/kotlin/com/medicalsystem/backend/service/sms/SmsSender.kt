package com.medicalsystem.backend.service.sms

import com.medicalsystem.backend.model.MobileNumber

data class SmsSendResult(
    val success: Boolean,
    val messageId: String? = null,
    val errorCode: String? = null,
    val errorMessage: String? = null
)

interface SmsSender {
    fun sendVerificationCode(phone: MobileNumber, code: String): SmsSendResult
}
