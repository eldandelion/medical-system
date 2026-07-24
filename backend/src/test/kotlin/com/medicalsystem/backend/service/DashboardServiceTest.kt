package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.repository.CollegeRepository
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.entity.HospitalEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class DashboardServiceTest {

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var collegeRepository: CollegeRepository

    @Mock
    private lateinit var hospitalRepository: HospitalRepository

    @InjectMocks
    private lateinit var dashboardService: DashboardService

    @Test
    fun `getStudentProfile maps domain model to dto correctly`() {
        val mockUser = StudentUser(id = 1L, name = "John Doe", email = EmailAddress("john@univ.edu.cn"))
        
        val college = College(id = 10L, name = "Engineering")
        val major = Major(id = 100L, name = "Computer Science", college = college)
        val student = Student(
            id = 1L,
            studentNumber = "ST123",
            name = "John Doe",
            major = major,
            enrollmentDate = LocalDate.now(),
            riskStatus = RiskStatus.LOW
        )

        `when`(studentRepository.findById(1L)).thenReturn(Optional.of(student))

        val result = dashboardService.getStudentProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("John Doe", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.STUDENT, result.role)
        assertEquals("ST123", result.studentId)
        assertEquals("Engineering", result.school)
        assertEquals("Computer Science", result.department)
    }

    @Test
    fun `getTeacherProfile maps domain model to dto correctly`() {
        val mockUser = Teacher(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), employeeNumber = SchoolEmployeeId("EMP-123"), collegeId = 50L)
        val teacherUser = Teacher(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), employeeNumber = SchoolEmployeeId("EMP-123"), collegeId = 50L)
        val college = College(id = 50L, name = "Science")

        `when`(userRepository.findById(2L)).thenReturn(Optional.of(teacherUser))
        `when`(collegeRepository.findById(50L)).thenReturn(Optional.of(college))

        val result = dashboardService.getTeacherProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Jane Smith", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.TEACHER, result.role)
        assertEquals("EMP-123", result.employeeId)
        assertEquals("Science", result.department)
    }

    @Test
    fun `getTrialAdminProfile maps domain model to dto correctly`() {
        val mockUser = TrialAdmin(id = 3L, name = "Admin Wang", email = EmailAddress("admin@univ.edu.cn"), employeeNumber = HospitalEmployeeId("HOSP-001"), hospitalId = 200L)
        val hospital = HospitalEntity(id = 200L, name = "University Hospital")

        `when`(userRepository.findById(3L)).thenReturn(Optional.of(mockUser))
        `when`(hospitalRepository.findById(200L)).thenReturn(Optional.of(hospital))

        val result = dashboardService.getTrialAdminProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Admin Wang", result.name)
        assertEquals(com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN, result.role)
        assertEquals("HOSP-001", result.employeeId)
        assertEquals("University Hospital", result.hospital)
    }
}
