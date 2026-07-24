package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.ProfileSummaryDto
import com.medicalsystem.backend.model.StudentUser
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.service.DashboardService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.ResponseEntity
import org.junit.jupiter.api.Assertions.*

@ExtendWith(MockitoExtension::class)
class DashboardControllerTest {

    @Mock
    private lateinit var dashboardService: DashboardService

    @InjectMocks
    private lateinit var dashboardController: DashboardController

    @Test
    fun `getStudentProfile returns mapped dto`() {
        val mockUser = StudentUser(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"))
        val dto = ProfileSummaryDto(
            avatarUrl = "https://example.com/avatar.png",
            name = "John Doe",
            role = com.medicalsystem.backend.model.UserRole.STUDENT,
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
        assertEquals(com.medicalsystem.backend.model.UserRole.STUDENT, response.body?.role)
        assertEquals("ST123", response.body?.studentId)
    }

    @Test
    fun `getTrialAdminProfile returns mapped dto`() {
        val mockUser = com.medicalsystem.backend.model.TrialAdmin(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), employeeNumber = com.medicalsystem.backend.model.HospitalEmployeeId("HOSP-001"), hospitalId = 200L)
        val dto = ProfileSummaryDto(
            avatarUrl = null,
            name = "Admin Wang",
            role = com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN,
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
}
