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
    private lateinit var studentHealthProfileJpaRepository: com.medicalsystem.backend.repository.StudentHealthProfileJpaRepository
    
    @Mock
    private lateinit var eventPublisher: DomainEventPublisher
    
    @Mock
    private lateinit var psychometricSummaryMapper: com.medicalsystem.backend.mapper.PsychometricSummaryMapper

    @Mock
    private lateinit var userJpaRepository: com.medicalsystem.backend.repository.UserJpaRepository

    @InjectMocks
    private lateinit var studentService: StudentService

    @Test
    fun `fetchAllStudents returns visible students`() {
        val user = com.medicalsystem.backend.model.User(1L, "Teacher", com.medicalsystem.backend.model.EmailAddress("t@t.com"), null, com.medicalsystem.backend.model.UserRole.TEACHER)
        val college = College(1L, "Engineering")
        val major = Major(1L, "CS", college)
        val model = Student(1L, "S123", "John Doe", major, LocalDate.of(2023, 9, 1), RiskStatus.LOW, null)
        val dto = StudentDto("1", "S123", "John Doe", 1L, "CS", LocalDate.of(2023, 9, 1), "BACHELOR", 1L, RiskStatus.LOW)
        
        `when`(studentRepository.findVisibleStudentsFor(user)).thenReturn(listOf(model))
        `when`(studentMapper.toDto(model)).thenReturn(dto)

        val result = studentService.fetchAllStudents(user)

        assertEquals(1, result.size)
        assertEquals("1", result[0].id)
    }

    @Test
    fun `fetchStudentDetails throws exception when not visible`() {
        val user = com.medicalsystem.backend.model.User(1L, "Teacher", com.medicalsystem.backend.model.EmailAddress("t@t.com"), null, com.medicalsystem.backend.model.UserRole.TEACHER)
        `when`(studentRepository.findByIdAndVisibleTo(1L, user)).thenReturn(Optional.empty())
        
        assertThrows(com.medicalsystem.backend.exception.StudentNotFoundException::class.java) {
            studentService.fetchStudentDetails(1L, user)
        }
    }

    @Test
    fun `fetchAllStudents batch-fetches assigned teacher names once via findAllById`() {
        val admin = com.medicalsystem.backend.model.User(
            99L,
            "Admin",
            com.medicalsystem.backend.model.EmailAddress("admin@t.com"),
            null,
            com.medicalsystem.backend.model.UserRole.SYSTEM_ADMIN
        )
        val college = College(1L, "Engineering")
        val major = Major(1L, "CS", college)
        val s1 = Student(1L, "S001", "Alice", major, LocalDate.of(2024, 9, 1), RiskStatus.LOW, null, assignedTeacherId = 201L)
        val s2 = Student(2L, "S002", "Bob", major, LocalDate.of(2024, 9, 1), RiskStatus.LOW, null, assignedTeacherId = 201L)
        val s3 = Student(3L, "S003", "Carol", major, LocalDate.of(2024, 9, 1), RiskStatus.LOW, null, assignedTeacherId = null)

        val teacherUser = com.medicalsystem.backend.entity.UserEntity(
            id = 201L,
            name = "张老师",
            email = com.medicalsystem.backend.model.EmailAddress("t201@univ.edu.cn"),
            role = com.medicalsystem.backend.model.UserRole.TEACHER
        )
        val expectedLookup = mapOf(201L to "张老师")
        val dto1 = StudentDto("1", "S001", "Alice", 1L, "CS", LocalDate.of(2024, 9, 1), null, null, RiskStatus.LOW, assignedTeacherId = 201L, assignedTeacherName = "张老师")
        val dto2 = StudentDto("2", "S002", "Bob", 1L, "CS", LocalDate.of(2024, 9, 1), null, null, RiskStatus.LOW, assignedTeacherId = 201L, assignedTeacherName = "张老师")
        val dto3 = StudentDto("3", "S003", "Carol", 1L, "CS", LocalDate.of(2024, 9, 1), null, null, RiskStatus.LOW, assignedTeacherId = null, assignedTeacherName = null)

        `when`(studentRepository.findVisibleStudentsFor(admin)).thenReturn(listOf(s1, s2, s3))
        `when`(userJpaRepository.findAllById(setOf(201L))).thenReturn(listOf(teacherUser))
        `when`(studentMapper.toDto(s1, expectedLookup)).thenReturn(dto1)
        `when`(studentMapper.toDto(s2, expectedLookup)).thenReturn(dto2)
        `when`(studentMapper.toDto(s3, expectedLookup)).thenReturn(dto3)

        val result = studentService.fetchAllStudents(admin)

        assertEquals(3, result.size)
        assertEquals(201L, result[0].assignedTeacherId)
        assertEquals("张老师", result[0].assignedTeacherName)
        assertNull(result[2].assignedTeacherId)
        org.mockito.Mockito.verify(userJpaRepository, org.mockito.Mockito.times(1)).findAllById(setOf(201L))
    }
}
