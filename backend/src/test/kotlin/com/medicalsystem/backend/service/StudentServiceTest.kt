package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.model.College
import com.medicalsystem.backend.model.Major
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.repository.MajorRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.mapper.StudentMapper
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.util.Optional
import com.medicalsystem.backend.event.DomainEventPublisher

@ExtendWith(MockitoExtension::class)
class StudentServiceTest {

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var majorRepository: MajorRepository
    
    @Mock
    private lateinit var studentMapper: StudentMapper
    
    @Mock
    private lateinit var healthProfileRepository: StudentHealthProfileRepository
    
    @Mock
    private lateinit var eventPublisher: DomainEventPublisher

    @InjectMocks
    private lateinit var studentService: StudentService

    @Test
    fun `fetchAllStudents returns all mapped students`() {
        val college = College(1L, "Engineering")
        val major = Major(1L, "CS", college)
        val model = Student(1L, "S123", "John Doe", major, LocalDate.of(2023, 9, 1), RiskStatus.LOW, null)
        val dto = StudentDto("1", "S123", "John Doe", 1L, "CS", LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        
        `when`(studentRepository.findAll()).thenReturn(listOf(model))
        `when`(studentMapper.toDto(model)).thenReturn(dto)

        val result = studentService.fetchAllStudents()

        assertEquals(1, result.size)
        assertEquals("1", result[0].id)
    }
}
