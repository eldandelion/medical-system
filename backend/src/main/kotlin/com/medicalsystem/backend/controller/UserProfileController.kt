package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.UpdateUserProfileRequest
import com.medicalsystem.backend.dto.UserProfileDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.UserProfileService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/user/profile")
class UserProfileController(
    private val userProfileService: UserProfileService
) {

    @GetMapping
    fun getProfile(@CurrentUser user: User?): ResponseEntity<UserProfileDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        val profile = userProfileService.getProfile(currentUser)
        return ResponseEntity.ok(profile)
    }

    @PutMapping
    fun updateProfile(
        @Valid @RequestBody request: UpdateUserProfileRequest,
        @CurrentUser user: User?
    ): ResponseEntity<UserProfileDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        val updated = userProfileService.updateProfile(currentUser, request)
        return ResponseEntity.ok(updated)
    }
}
