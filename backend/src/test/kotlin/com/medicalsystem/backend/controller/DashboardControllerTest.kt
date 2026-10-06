package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.DashboardService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.ResponseEntity

@ExtendWith(MockitoExtension::class)
class DashboardControllerTest {

    @Mock
    private lateinit var dashboardService: DashboardService

    @InjectMocks
    private lateinit var dashboardController: DashboardController

    @Test
    fun `getStudentProfile returns mapped dto`() {
        val mockUser = User(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"), role = UserRole.STUDENT)
        val dto = ProfileSummaryDto(
            avatarUrl = "https://example.com/avatar.png",
            name = "John Doe",
            role = UserRole.STUDENT,
            studentId = "ST123",
            school = "Engineering",
            department = "Computer Science"
        )
        
        `when`(dashboardService.getStudentProfile(mockUser)).thenReturn(dto)

        val response: ResponseEntity<ProfileSummaryDto> = dashboardController.getStudentProfile(mockUser)
        
        assertEquals(200, response.statusCode.value())
        assertNotNull(response.body)
        assertEquals("https://example.com/avatar.png", response.body?.avatarUrl)
        assertEquals("John Doe", response.body?.name)
        assertEquals(UserRole.STUDENT, response.body?.role)
        assertEquals("ST123", response.body?.studentId)
    }

    @Test
    fun `getTrialAdminProfile returns mapped dto`() {
        val mockUser = User(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        val dto = ProfileSummaryDto(
            avatarUrl = null,
            name = "Admin Wang",
            role = UserRole.TRIAL_ADMIN,
            employeeId = "HOSP-001",
            hospital = "University Hospital"
        )
        
        `when`(dashboardService.getTrialAdminProfile(mockUser)).thenReturn(dto)

        val response: ResponseEntity<ProfileSummaryDto> = dashboardController.getTrialAdminProfile(mockUser)
        
        assertEquals(200, response.statusCode.value())
        assertNotNull(response.body)
        assertEquals("Admin Wang", response.body?.name)
        assertEquals("HOSP-001", response.body?.employeeId)
        assertEquals("University Hospital", response.body?.hospital)
    }

    @Test
    fun `getStudentDashboard returns metrics response`() {
        val mockUser = User(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"), role = UserRole.STUDENT)
        val dto = DashboardResponseDto(StudentMetricsDto(assessmentsCount = 0L, notificationsCount = 4L))
        `when`(dashboardService.getStudentDashboard(mockUser)).thenReturn(dto)

        val response = dashboardController.getStudentDashboard(mockUser)

        assertEquals(200, response.statusCode.value())
        assertEquals(4L, response.body?.metrics?.notificationsCount)
    }

    @Test
    fun `getTeacherDashboard returns metrics response`() {
        val mockUser = User(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), role = UserRole.TEACHER)
        val dto = DashboardResponseDto(TeacherMetricsDto(studentsCount = 42L, notificationsCount = 3L))
        `when`(dashboardService.getTeacherDashboard(mockUser)).thenReturn(dto)

        val response = dashboardController.getTeacherDashboard(mockUser)

        assertEquals(200, response.statusCode.value())
        assertEquals(42L, response.body?.metrics?.studentsCount)
        assertEquals(3L, response.body?.metrics?.notificationsCount)
    }

    @Test
    fun `getHeadCounsellorDashboard returns metrics response`() {
        val mockUser = User(id = 4L, name = "Counsellor Li", email = EmailAddress("li@univ.edu.cn"), role = UserRole.HEAD_COUNSELLOR)
        val dto = DashboardResponseDto(HeadCounsellorMetricsDto(studentsCount = 100L, referralsCount = 6L))
        `when`(dashboardService.getHeadCounsellorDashboard(mockUser)).thenReturn(dto)

        val response = dashboardController.getHeadCounsellorDashboard(mockUser)

        assertEquals(200, response.statusCode.value())
        assertEquals(100L, response.body?.metrics?.studentsCount)
        assertEquals(6L, response.body?.metrics?.referralsCount)
    }

    @Test
    fun `getTrialAdminDashboard returns metrics response`() {
        val mockUser = User(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        val dto = DashboardResponseDto(TrialAdminMetricsDto(staffCount = 15L, referralsCount = 4L))
        `when`(dashboardService.getTrialAdminDashboard(mockUser)).thenReturn(dto)

        val response = dashboardController.getTrialAdminDashboard(mockUser)

        assertEquals(200, response.statusCode.value())
        assertEquals(15L, response.body?.metrics?.staffCount)
        assertEquals(4L, response.body?.metrics?.referralsCount)
    }

    @Test
    fun `getDoctorDashboard returns metrics response`() {
        val mockUser = User(id = 5L, name = "Dr. House", email = EmailAddress("house@univ.edu.cn"), role = UserRole.DOCTOR)
        val dto = DashboardResponseDto(DoctorMetricsDto(referralsCount = 7L, notificationsCount = 1L))
        `when`(dashboardService.getDoctorDashboard(mockUser)).thenReturn(dto)

        val response = dashboardController.getDoctorDashboard(mockUser)

        assertEquals(200, response.statusCode.value())
        assertEquals(7L, response.body?.metrics?.referralsCount)
        assertEquals(1L, response.body?.metrics?.notificationsCount)
    }

    @Test
    fun `getRecentActivity returns feed response`() {
        val mockUser = User(id = 5L, name = "Dr. House", email = EmailAddress("house@univ.edu.cn"), role = UserRole.DOCTOR)
        val dto = DashboardActivityFeedDto(emptyList())
        `when`(dashboardService.getRecentActivity(mockUser)).thenReturn(dto)

        val response = dashboardController.getRecentActivity(mockUser)
        assertEquals(200, response.statusCode.value())
        assertEquals(0, response.body?.activities?.size)
    }
}
