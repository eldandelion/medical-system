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

    @Test
    fun `getPsychometrics should return correctly formatted summary and fallback missing flags to negative`() {
        val collegeEntity = CollegeEntity(1L, "Engineering")
        val majorEntity = MajorEntity(1L, "CS", collegeEntity)
        val entity = StudentEntity(
            id = 1L,
            studentNumber = "S123",
            name = "John Doe",
            major = majorEntity,
            enrollmentDate = LocalDate.of(2023, 9, 1),
            riskStatus = RiskStatus.LOW,
            scidDiagnosis = "Anxiety"
        )
        
        // Add one positive flag and one psychometric test
        val flag = com.medicalsystem.backend.entity.RiskFlagEntity(
            name = com.medicalsystem.backend.model.RiskFlagName.SUICIDAL_IDEATION,
            status = com.medicalsystem.backend.model.FlagStatus.POSITIVE,
            student = entity
        )
        entity.riskFlags.add(flag)
        
        val test = com.medicalsystem.backend.entity.PsychometricTestEntity(
            testResultName = com.medicalsystem.backend.model.TestResultName.GAD_7,
            score = 15,
            maxScore = 21,
            level = "重度",
            testDate = LocalDate.now(),
            student = entity
        )
        entity.psychometricTests.add(test)

        `when`(studentRepository.findById(1L)).thenReturn(Optional.of(entity))

        val summary = studentService.getPsychometrics(1L)
        
        assertEquals("Anxiety", summary.scidDiagnosis)
        
        // Assert exactly 3 flags
        assertEquals(3, summary.riskFlags.size)
        // SUICIDAL_IDEATION should be true because it's in the DB
        assertEquals("自杀意念终身", summary.riskFlags[0].label)
        assertEquals(true, summary.riskFlags[0].value)
        // Others should default to false
        assertEquals("自杀尝试终身", summary.riskFlags[1].label)
        assertEquals(false, summary.riskFlags[1].value)
        assertEquals("自伤行为终身", summary.riskFlags[2].label)
        assertEquals(false, summary.riskFlags[2].value)
        
        // Assert tests and charts mapping
        assertEquals(1, summary.tests.size)
        assertEquals(1, summary.scores.size) // Trend for GAD-7
        assertEquals(1, summary.radarData.size)
        assertEquals("GAD-7", summary.radarData[0].subject)
    }

    @Test
    fun `getPsychometrics should throw ResourceNotFoundException when student missing`() {
        `when`(studentRepository.findById(99L)).thenReturn(Optional.empty())
        
        assertThrows(ResourceNotFoundException::class.java) {
            studentService.getPsychometrics(99L)
        }
    }
}

