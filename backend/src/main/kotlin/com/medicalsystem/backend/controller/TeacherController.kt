package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AssignTeacherStudentsRequest
import com.medicalsystem.backend.dto.AssignTeacherStudentsResponse
import com.medicalsystem.backend.dto.TeacherDetailDto
import com.medicalsystem.backend.dto.TeacherSummaryDto
import com.medicalsystem.backend.dto.UnassignStudentResponse
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.service.TeacherService
import jakarta.validation.Valid
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/teachers")
class TeacherController(
    private val teacherService: TeacherService
) {
    private val allowedRoles = setOf(UserRole.SYSTEM_ADMIN, UserRole.HEAD_COUNSELLOR)

    private fun requireAuthorizedUser(user: User?): User {
        val currentUser = user ?: throw ForbiddenException("Authorized user not found")
        if (currentUser.role !in allowedRoles) {
            throw ForbiddenException("Only System Admins and Head Counsellors can manage teacher assignments")
        }
        return currentUser
    }

    @GetMapping
    fun getTeachers(
        @RequestParam(required = false) keyword: String?,
        @RequestParam(required = false) status: AccountStatus?,
        @CurrentUser user: User?
    ): ResponseEntity<List<TeacherSummaryDto>> {
        requireAuthorizedUser(user)
        return ResponseEntity.ok(teacherService.getTeachers(keyword, status))
    }

    @GetMapping("/{teacherId}")
    fun getTeacherDetails(
        @PathVariable teacherId: Long,
        @CurrentUser user: User?
    ): ResponseEntity<TeacherDetailDto> {
        requireAuthorizedUser(user)
        return ResponseEntity.ok(teacherService.getTeacherDetails(teacherId))
    }

    @PostMapping("/{teacherId}/students")
    fun assignStudents(
        @PathVariable teacherId: Long,
        @Valid @RequestBody request: AssignTeacherStudentsRequest,
        @CurrentUser user: User?
    ): ResponseEntity<AssignTeacherStudentsResponse> {
        val currentUser = requireAuthorizedUser(user)
        return ResponseEntity.ok(teacherService.assignStudents(teacherId, request.studentIds, currentUser))
    }

    @DeleteMapping("/{teacherId}/students/{studentId}")
    fun unassignStudent(
        @PathVariable teacherId: Long,
        @PathVariable studentId: Long,
        @CurrentUser user: User?
    ): ResponseEntity<UnassignStudentResponse> {
        requireAuthorizedUser(user)
        return ResponseEntity.ok(teacherService.unassignStudent(teacherId, studentId))
    }
}
