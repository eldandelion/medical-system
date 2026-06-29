package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.service.StudentService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class StudentControllerTest {

    @Mock
    private lateinit var studentService: StudentService

    @InjectMocks
    private lateinit var studentController: StudentController

    @Test
    fun `should return all students`() {
        val student = StudentDto("1", "S123", "John Doe", 1L, "CS", java.time.LocalDate.of(2023, 9, 1), com.medicalsystem.backend.model.AcademicYear.SOPHOMORE, com.medicalsystem.backend.model.RiskStatus.LOW)
        `when`(studentService.getAllStudents()).thenReturn(listOf(student))

        val response = studentController.getAllStudents()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals(1, response.body?.size)
        assertEquals("John Doe", response.body?.get(0)?.name)
    }

    @Test
    fun `should create a student`() {
        val inputDto = StudentDto(null, "S123", "John Doe", 1L, "CS", java.time.LocalDate.of(2023, 9, 1), null, com.medicalsystem.backend.model.RiskStatus.LOW)
        val savedDto = StudentDto("1", "S123", "John Doe", 1L, "CS", java.time.LocalDate.of(2023, 9, 1), com.medicalsystem.backend.model.AcademicYear.SOPHOMORE, com.medicalsystem.backend.model.RiskStatus.LOW)
        
        `when`(studentService.createStudent(any())).thenReturn(savedDto)

        val response = studentController.createStudent(inputDto)
        
        assertEquals(HttpStatus.CREATED, response.statusCode)
        assertEquals("1", response.body?.id)
        assertEquals("John Doe", response.body?.name)
    }

    @Test
    fun `should return psychometrics summary`() {
        val summaryDto = com.medicalsystem.backend.dto.PsychometricsSummaryDto(
            scidDiagnosis = "Major Depression",
            riskFlags = listOf(
                com.medicalsystem.backend.dto.RiskFlagDto("自杀意念终身", true),
                com.medicalsystem.backend.dto.RiskFlagDto("自杀尝试终身", false),
                com.medicalsystem.backend.dto.RiskFlagDto("自伤行为终身", false)
            ),
            scores = emptyList(),
            radarData = emptyList(),
            tests = emptyList()
        )
        
        `when`(studentService.getPsychometrics(1L)).thenReturn(summaryDto)

        val response = studentController.getPsychometrics(1L)
        
        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("Major Depression", response.body?.scidDiagnosis)
        assertEquals(3, response.body?.riskFlags?.size)
    }
}
