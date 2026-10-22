package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.AuthService
import com.medicalsystem.backend.service.EmailOtpService
import com.medicalsystem.backend.service.StaffRegistrationService
import com.medicalsystem.backend.service.UserVerificationService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/auth")
class AuthController(
    private val userVerificationService: UserVerificationService,
    private val emailOtpService: EmailOtpService,
    private val staffRegistrationService: StaffRegistrationService,
    private val authService: AuthService
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

    @PostMapping("/student-register")
    fun registerStudent(
        @Valid @RequestBody request: StudentRegisterRequest
    ): ResponseEntity<AuthResponse> {
        val response = authService.registerStudent(request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/check-availability")
    fun checkAvailability(
        @RequestParam(required = false) studentNumber: String?,
        @RequestParam(required = false) phone: String?
    ): ResponseEntity<CheckAvailabilityResponse> {
        val response = authService.checkAvailability(studentNumber, phone)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/login")
    fun login(
        @Valid @RequestBody request: LoginRequest
    ): ResponseEntity<AuthResponse> {
        val response = authService.login(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/login-sms")
    fun loginSms(
        @Valid @RequestBody request: LoginSmsRequest
    ): ResponseEntity<AuthResponse> {
        val response = authService.loginWithSms(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/send-code")
    fun sendCode(
        @Valid @RequestBody request: SendCodeRequest
    ): ResponseEntity<SendCodeResponse> {
        val response = authService.sendVerificationCode(request)
        return ResponseEntity.ok(response)
    }

    @PostMapping("/verify-code")
    fun verifyCode(
        @Valid @RequestBody request: VerifyCodeRequest
    ): ResponseEntity<VerifyCodeResponse> {
        val response = authService.verifyCode(request)
        return ResponseEntity.ok(response)
    }

    @GetMapping("/me")
    fun getMe(
        @CurrentUser user: User?
    ): ResponseEntity<StudentAuthDto> {
        val currentUser = user ?: throw ForbiddenException("未登录或登录已失效")
        return ResponseEntity.ok(authService.getMe(currentUser))
    }
}
