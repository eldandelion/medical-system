package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.StudentRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any

@ExtendWith(MockitoExtension::class)
class StudentServiceTest {

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var majorRepository: com.medicalsystem.backend.repository.MajorRepository

    @InjectMocks
    private lateinit var studentService: StudentService

    @Test
    fun `should get all students mapped to dto`() {
        val college = com.medicalsystem.backend.entity.CollegeEntity(1L, "Engineering")
        val major = com.medicalsystem.backend.entity.MajorEntity(1L, "CS", college)
        val entity = StudentEntity(1L, "S123", "John Doe", major, java.time.LocalDate.of(2023, 9, 1), com.medicalsystem.backend.entity.RiskStatus.LOW)
        `when`(studentRepository.findAll()).thenReturn(listOf(entity))

        val result = studentService.getAllStudents()

        assertEquals(1, result.size)
        assertEquals("1", result[0].id)
        assertEquals("John Doe", result[0].name)
    }

    @Test
    fun `should create student and map back to dto`() {
        val dto = StudentDto(null, "S123", "John Doe", 1L, null, java.time.LocalDate.of(2023, 9, 1), null, com.medicalsystem.backend.entity.RiskStatus.LOW)
        
        val college = com.medicalsystem.backend.entity.CollegeEntity(1L, "Engineering")
        val major = com.medicalsystem.backend.entity.MajorEntity(1L, "CS", college)
        val savedEntity = StudentEntity(1L, "S123", "John Doe", major, java.time.LocalDate.of(2023, 9, 1), com.medicalsystem.backend.entity.RiskStatus.LOW)
        
        `when`(majorRepository.findById(1L)).thenReturn(java.util.Optional.of(major))
        
        `when`(studentRepository.save(any())).thenReturn(savedEntity)

        val result = studentService.createStudent(dto)

        assertNotNull(result.id)
        assertEquals("1", result.id)
        assertEquals("John Doe", result.name)
    }
}
