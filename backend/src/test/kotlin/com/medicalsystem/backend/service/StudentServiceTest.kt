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

    @InjectMocks
    private lateinit var studentService: StudentService

    @Test
    fun `should get all students mapped to dto`() {
        val entity = StudentEntity(1L, "S123", "John Doe", "CS", "Year 1", "Active")
        `when`(studentRepository.findAll()).thenReturn(listOf(entity))

        val result = studentService.getAllStudents()

        assertEquals(1, result.size)
        assertEquals("1", result[0].id)
        assertEquals("John Doe", result[0].name)
    }

    @Test
    fun `should create student and map back to dto`() {
        val dto = StudentDto(null, "S123", "John Doe", "CS", "Year 1", "Active")
        val savedEntity = StudentEntity(1L, "S123", "John Doe", "CS", "Year 1", "Active")
        
        `when`(studentRepository.save(any())).thenReturn(savedEntity)

        val result = studentService.createStudent(dto)

        assertNotNull(result.id)
        assertEquals("1", result.id)
        assertEquals("John Doe", result.name)
    }
}
