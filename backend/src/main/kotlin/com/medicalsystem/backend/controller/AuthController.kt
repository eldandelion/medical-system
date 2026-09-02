package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.service.EmailOtpService
import com.medicalsystem.backend.service.StaffRegistrationService
import com.medicalsystem.backend.service.UserVerificationService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userVerificationService: UserVerificationService,
    private val emailOtpService: EmailOtpService,
    private val staffRegistrationService: StaffRegistrationService
) {

    @PostMapping("/verify-identifier")
    fun verifyIdentifier(
        @Valid @RequestBody request: VerifyIdentifierRequest
    ): ResponseEntity<VerifyIdentifierResponse> {
        val result = userVerificationService.verifyIdentifier(request)
        return ResponseEntity.ok(result)
    }

    @PostMapping("/send-email-otp")
    fun sendEmailOtp(
        @Valid @RequestBody request: SendEmailOtpRequest
    ): ResponseEntity<SendEmailOtpResponse> {
        val cooldown = emailOtpService.sendOtp(request.email)
        return ResponseEntity.ok(SendEmailOtpResponse(cooldownSeconds = cooldown))
    }

    @PostMapping("/register")
    fun register(
        @Valid @RequestBody request: RegisterStaffRequest
    ): ResponseEntity<RegisterResponse> {
        val result = staffRegistrationService.registerStaff(request)
        return ResponseEntity.ok(result)
    }
}
