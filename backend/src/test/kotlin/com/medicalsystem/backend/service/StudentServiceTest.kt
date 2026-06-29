package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.MajorRepository
import com.medicalsystem.backend.mapper.StudentMapper
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import java.time.LocalDate
import java.util.Optional
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.Major
import com.medicalsystem.backend.model.College

@ExtendWith(MockitoExtension::class)
class StudentServiceTest {

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var majorRepository: MajorRepository
    
    @Mock
    private lateinit var studentMapper: StudentMapper

    @InjectMocks
    private lateinit var studentService: StudentService

    @Test
    fun `should get all students mapped to dto`() {
        val collegeEntity = CollegeEntity(1L, "Engineering")
        val majorEntity = MajorEntity(1L, "CS", collegeEntity)
        val entity = StudentEntity(1L, "S123", "John Doe", majorEntity, LocalDate.of(2023, 9, 1), RiskStatus.LOW)
        
        val college = College(1L, "Engineering")
        val major = Major(1L, "CS", college)
        val model = Student(1L, "S123", "John Doe", major, LocalDate.of(2023, 9, 1), RiskStatus.LOW)
        
        val dto = StudentDto("1", "S123", "John Doe", 1L, "CS", LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        
        `when`(studentRepository.findAll()).thenReturn(listOf(entity))
        `when`(studentMapper.toModel(entity)).thenReturn(model)
        `when`(studentMapper.toDto(model)).thenReturn(dto)

        val result = studentService.getAllStudents()

        assertEquals(1, result.size)
        assertEquals("1", result[0].id)
        assertEquals("John Doe", result[0].name)
    }

    @Test
    fun `should get student by id`() {
        val collegeEntity = CollegeEntity(1L, "Engineering")
        val majorEntity = MajorEntity(1L, "CS", collegeEntity)
        val entity = StudentEntity(1L, "S123", "John Doe", majorEntity, LocalDate.of(2023, 9, 1), RiskStatus.LOW)
        
        val college = College(1L, "Engineering")
        val major = Major(1L, "CS", college)
        val model = Student(1L, "S123", "John Doe", major, LocalDate.of(2023, 9, 1), RiskStatus.LOW)
        
        val dto = StudentDto("1", "S123", "John Doe", 1L, "CS", LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        
        `when`(studentRepository.findById(1L)).thenReturn(Optional.of(entity))
        `when`(studentMapper.toModel(entity)).thenReturn(model)
        `when`(studentMapper.toDto(model)).thenReturn(dto)

        val result = studentService.getStudentById(1L)
        assertEquals("1", result.id)
    }

    @Test
    fun `getStudentById should throw ResourceNotFoundException when missing`() {
        `when`(studentRepository.findById(99L)).thenReturn(Optional.empty())
        
        assertThrows(ResourceNotFoundException::class.java) {
            studentService.getStudentById(99L)
        }
    }

    @Test
    fun `createStudent should throw ValidationException when majorId is null`() {
        val dto = StudentDto(null, "S123", "John Doe", null, null, LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        
        assertThrows(ValidationException::class.java) {
            studentService.createStudent(dto)
        }
    }

    @Test
    fun `createStudent should throw ConflictException when studentNumber exists`() {
        val dto = StudentDto(null, "S123", "John Doe", 1L, null, LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        `when`(studentRepository.existsByStudentNumber("S123")).thenReturn(true)
        
        assertThrows(ConflictException::class.java) {
            studentService.createStudent(dto)
        }
    }
    
    @Test
    fun `createStudent should create student and map back to dto`() {
        val dto = StudentDto(null, "S123", "John Doe", 1L, null, LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        
        val collegeEntity = CollegeEntity(1L, "Engineering")
        val majorEntity = MajorEntity(1L, "CS", collegeEntity)
        val savedEntity = StudentEntity(1L, "S123", "John Doe", majorEntity, LocalDate.of(2023, 9, 1), RiskStatus.LOW)
        
        val college = College(1L, "Engineering")
        val major = Major(1L, "CS", college)
        val model = Student(1L, "S123", "John Doe", major, LocalDate.of(2023, 9, 1), RiskStatus.LOW)
        
        val outDto = StudentDto("1", "S123", "John Doe", 1L, "CS", LocalDate.of(2023, 9, 1), null, RiskStatus.LOW)
        
        `when`(studentRepository.existsByStudentNumber("S123")).thenReturn(false)
        `when`(majorRepository.findById(1L)).thenReturn(Optional.of(majorEntity))
        `when`(studentRepository.save(any())).thenReturn(savedEntity)
        `when`(studentMapper.toModel(savedEntity)).thenReturn(model)
        `when`(studentMapper.toDto(model)).thenReturn(outDto)

        val result = studentService.createStudent(dto)

        assertNotNull(result.id)
        assertEquals("1", result.id)
        assertEquals("John Doe", result.name)
    }
}

