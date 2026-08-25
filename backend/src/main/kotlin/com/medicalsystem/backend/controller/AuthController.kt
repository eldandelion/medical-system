package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.VerifyIdentifierRequest
import com.medicalsystem.backend.dto.VerifyIdentifierResponse
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
    private val userVerificationService: UserVerificationService
) {

    @PostMapping("/verify-identifier")
    fun verifyIdentifier(
        @Valid @RequestBody request: VerifyIdentifierRequest
    ): ResponseEntity<VerifyIdentifierResponse> {
        val result = userVerificationService.verifyIdentifier(request)
        return ResponseEntity.ok(result)
    }
}
