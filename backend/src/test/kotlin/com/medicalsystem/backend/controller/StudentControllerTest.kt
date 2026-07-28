package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.service.StudentService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import org.junit.jupiter.api.Assertions.*

@ExtendWith(MockitoExtension::class)
class StudentControllerTest {

    @Mock
    private lateinit var studentService: StudentService

    @InjectMocks
    private lateinit var studentController: StudentController

    @Test
    fun `fetchAllStudents throws ForbiddenException when user is null`() {
        assertThrows(com.medicalsystem.backend.exception.ForbiddenException::class.java) {
            studentController.fetchAllStudents(null)
        }
    }

    @Test
    fun `fetchAllStudents returns list of students for valid user`() {
        val user = com.medicalsystem.backend.model.User(1L, "Teacher", com.medicalsystem.backend.model.EmailAddress("t@t.com"), null, com.medicalsystem.backend.model.UserRole.TEACHER)
        val dto = StudentDto("1", "S123", "John Doe", 1L, "CS", java.time.LocalDate.now(), null, com.medicalsystem.backend.model.RiskStatus.LOW)
        `when`(studentService.fetchAllStudents(user)).thenReturn(listOf(dto))
        val response = studentController.fetchAllStudents(user)
        assertNotNull(response)
    }
}
