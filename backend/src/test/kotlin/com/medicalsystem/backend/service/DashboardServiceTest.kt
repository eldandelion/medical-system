package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
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
        assertEquals("John Doe", result.title)
        assertEquals("Student", result.subtitle)
        assertEquals("ST123", result.studentId)
        assertEquals("Engineering", result.school)
        assertEquals("Computer Science", result.department)
    }

    @Test
    fun `getTeacherProfile maps domain model to dto correctly`() {
        val mockUser = Teacher(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), collegeId = 50L)
        val teacherUser = Teacher(id = 2L, name = "Jane Smith", email = EmailAddress("jane@univ.edu.cn"), collegeId = 50L)

        `when`(userRepository.findById(2L)).thenReturn(Optional.of(teacherUser))

        val result = dashboardService.getTeacherProfile(mockUser)

        assertNull(result.avatarUrl)
        assertEquals("Jane Smith", result.title)
        assertEquals("Teacher", result.subtitle)
        assertEquals("2", result.employeeId)
        // department is currently hardcoded to null in our service stub
        assertEquals(null, result.department)
    }
}
