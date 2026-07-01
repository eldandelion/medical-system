package com.medicalsystem.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.exception.GlobalExceptionHandler
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.service.StudentService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

@ExtendWith(MockitoExtension::class)
class StudentControllerTest {

    private lateinit var mockMvc: MockMvc

    @Mock
    private lateinit var studentService: StudentService

    @InjectMocks
    private lateinit var studentController: StudentController

    private val objectMapper = ObjectMapper().apply {
        registerModule(JavaTimeModule())
    }

    @BeforeEach
    fun setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(studentController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
    }

    @Test
    fun `should return all students`() {
        val student = StudentDto("1", "S123", "John Doe", 1L, "CS", java.time.LocalDate.of(2023, 9, 1), com.medicalsystem.backend.model.AcademicYear.SOPHOMORE, com.medicalsystem.backend.model.RiskStatus.LOW)
        `when`(studentService.getAllStudents()).thenReturn(listOf(student))

        mockMvc.perform(get("/api/students"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].name").value("John Doe"))
            .andExpect(jsonPath("$[0].studentNumber").value("S123"))
    }

    @Test
    fun `should create a student`() {
        val inputDto = StudentDto(null, "S123", "John Doe", 1L, "CS", java.time.LocalDate.of(2023, 9, 1), null, com.medicalsystem.backend.model.RiskStatus.LOW)
        val savedDto = StudentDto("1", "S123", "John Doe", 1L, "CS", java.time.LocalDate.of(2023, 9, 1), com.medicalsystem.backend.model.AcademicYear.SOPHOMORE, com.medicalsystem.backend.model.RiskStatus.LOW)
        
        `when`(studentService.createStudent(any())).thenReturn(savedDto)

        mockMvc.perform(
            post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value("1"))
            .andExpect(jsonPath("$.name").value("John Doe"))
    }

    @Test
    fun `should return 400 when validation fails on create student`() {
        // Missing required blank fields and null majorId
        val inputDto = StudentDto(null, "", "", null, "CS", java.time.LocalDate.of(2023, 9, 1), null, com.medicalsystem.backend.model.RiskStatus.LOW)

        mockMvc.perform(
            post("/api/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Validation failed"))
    }

    @Test
    fun `should return psychometrics summary`() {
        val summaryDto = com.medicalsystem.backend.dto.PsychometricsSummaryDto(
            scidDiagnosis = "Major Depression",
            riskFlags = listOf(
                com.medicalsystem.backend.dto.RiskFlagDto("自杀意念终身", true)
            ),
            scores = emptyList(),
            radarData = emptyList(),
            tests = emptyList()
        )
        
        `when`(studentService.getPsychometrics(1L)).thenReturn(summaryDto)

        mockMvc.perform(get("/api/students/1/psychometrics"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.scidDiagnosis").value("Major Depression"))
            .andExpect(jsonPath("$.riskFlags[0].label").value("自杀意念终身"))
    }

    @Test
    fun `should return 404 when student not found`() {
        `when`(studentService.getStudentById(99L)).thenThrow(ResourceNotFoundException("Not found"))

        mockMvc.perform(get("/api/students/99"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("Not found"))
    }
}
