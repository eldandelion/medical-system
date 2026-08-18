package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.UserRole

data class ProfileSummaryDto(
    val avatarUrl: String?,
    val name: String,
    val role: UserRole,
    val studentId: String? = null,
    val employeeId: String? = null,
    val school: String? = null,
    val department: String? = null,
    val hospital: String? = null
)

sealed interface DashboardMetricsDto

data class StudentMetricsDto(
    val assessmentsCount: Long = 0,
    val notificationsCount: Long = 0
) : DashboardMetricsDto

data class TeacherMetricsDto(
    val studentsCount: Long = 0,
    val notificationsCount: Long = 0
) : DashboardMetricsDto

data class HeadCounsellorMetricsDto(
    val studentsCount: Long = 0,
    val referralsCount: Long = 0
) : DashboardMetricsDto

data class TrialAdminMetricsDto(
    val staffCount: Long = 0,
    val referralsCount: Long = 0
) : DashboardMetricsDto

data class DoctorMetricsDto(
    val referralsCount: Long = 0,
    val notificationsCount: Long = 0
) : DashboardMetricsDto

data class AdminMetricsDto(
    val totalUsersCount: Long = 0,
    val pendingApprovalsCount: Long = 0,
    val activeReferralsCount: Long = 0,
    val completedAssessmentsCount: Long = 0
) : DashboardMetricsDto

data class DashboardResponseDto<T : DashboardMetricsDto>(
    val metrics: T
)
