package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.security.CurrentUser
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

    @GetMapping("/head-councillor/profile")
    fun getHeadCounsellorProfile(@CurrentUser user: User): ResponseEntity<ProfileSummaryDto> =
        ResponseEntity.ok(dashboardService.getHeadCounsellorProfile(user))

    @GetMapping("/trial-admin/profile")
    fun getTrialAdminProfile(@CurrentUser user: User): ResponseEntity<ProfileSummaryDto> =
        ResponseEntity.ok(dashboardService.getTrialAdminProfile(user))

    @GetMapping("/doctor/profile")
    fun getDoctorProfile(@CurrentUser user: User): ResponseEntity<ProfileSummaryDto> =
        ResponseEntity.ok(dashboardService.getDoctorProfile(user))

    @GetMapping("/admin/profile")
    fun getAdminProfile(@CurrentUser user: User): ResponseEntity<ProfileSummaryDto> =
        ResponseEntity.ok(dashboardService.getAdminProfile(user))

    @GetMapping("/student")
    fun getStudentDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<StudentMetricsDto>> =
        ResponseEntity.ok(dashboardService.getStudentDashboard(user))

    @GetMapping("/teacher")
    fun getTeacherDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<TeacherMetricsDto>> =
        ResponseEntity.ok(dashboardService.getTeacherDashboard(user))

    @GetMapping("/head-councillor")
    fun getHeadCounsellorDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<HeadCounsellorMetricsDto>> =
        ResponseEntity.ok(dashboardService.getHeadCounsellorDashboard(user))

    @GetMapping("/trial-admin")
    fun getTrialAdminDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<TrialAdminMetricsDto>> =
        ResponseEntity.ok(dashboardService.getTrialAdminDashboard(user))

    @GetMapping("/doctor")
    fun getDoctorDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<DoctorMetricsDto>> =
        ResponseEntity.ok(dashboardService.getDoctorDashboard(user))

    @GetMapping("/admin")
    fun getAdminDashboard(@CurrentUser user: User): ResponseEntity<DashboardResponseDto<AdminMetricsDto>> =
        ResponseEntity.ok(dashboardService.getAdminDashboard(user))

    @GetMapping("/activity")
    fun getRecentActivity(@CurrentUser user: User): ResponseEntity<DashboardActivityFeedDto> =
        ResponseEntity.ok(dashboardService.getRecentActivity(user))
}
