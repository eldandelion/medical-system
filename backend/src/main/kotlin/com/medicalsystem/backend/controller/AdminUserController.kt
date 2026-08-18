package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AdminUserSummaryDto
import com.medicalsystem.backend.dto.UpdateAccountStatusRequest
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.UserManagementService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/admin/users")
class AdminUserController(
    private val userManagementService: UserManagementService
) {

    @GetMapping
    fun getUsers(
        @RequestParam(required = false) role: UserRole?,
        @RequestParam(required = false) status: AccountStatus?,
        @RequestParam(required = false) keyword: String?,
        @CurrentUser user: User?
    ): ResponseEntity<List<AdminUserSummaryDto>> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        val users = userManagementService.getUsers(role, status, keyword, currentUser)
        return ResponseEntity.ok(users)
    }

    @PutMapping("/{id}/status")
    fun updateUserStatus(
        @PathVariable id: Long,
        @Valid @RequestBody request: UpdateAccountStatusRequest,
        @CurrentUser user: User?
    ): ResponseEntity<AdminUserSummaryDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        val updated = userManagementService.updateUserStatus(id, request.status, request.reason, currentUser)
        return ResponseEntity.ok(updated)
    }

    @DeleteMapping("/{id}")
    fun deleteUser(
        @PathVariable id: Long,
        @CurrentUser user: User?
    ): ResponseEntity<AdminUserSummaryDto> {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        val deleted = userManagementService.deleteUser(id, currentUser)
        return ResponseEntity.ok(deleted)
    }
}
