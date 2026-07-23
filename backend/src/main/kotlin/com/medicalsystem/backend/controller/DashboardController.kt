package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.ProfileSummaryDto
import com.medicalsystem.backend.security.CurrentUser
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.service.DashboardService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/api/dashboard")
class DashboardController(
    private val dashboardService: DashboardService
) {
    @GetMapping("/student/profile")
    fun getStudentProfile(@CurrentUser user: User): ResponseEntity<ProfileSummaryDto> =
        ResponseEntity.ok(dashboardService.getStudentProfile(user))

    @GetMapping("/teacher/profile")
    fun getTeacherProfile(@CurrentUser user: User): ResponseEntity<ProfileSummaryDto> =
        ResponseEntity.ok(dashboardService.getTeacherProfile(user))
}
