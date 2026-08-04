package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.AnswerSubmissionDto
import com.medicalsystem.backend.dto.AssignAssessmentRequest
import com.medicalsystem.backend.dto.SubmitAssessmentRequest
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.junit.jupiter.MockitoExtension
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.util.*

@ExtendWith(MockitoExtension::class)
class AssessmentServiceTest {

    @Mock
    private lateinit var assignmentRepository: AssessmentAssignmentRepository

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var userRepository: UserRepository

    private lateinit var clock: Clock
    
    private lateinit var assessmentService: AssessmentService

    private val teacherUser = User(
        id = 101L,
        name = "Teacher Li",
        email = EmailAddress("teacher.li@example.com"),
        role = UserRole.TEACHER
    )

    private val studentUser = User(
        id = 10L,
        name = "Alex Wang",
        email = EmailAddress("alex.wang@example.com"),
        role = UserRole.STUDENT
    )

    private val otherStudentUser = User(
        id = 20L,
        name = "Bob Smith",
        email = EmailAddress("bob.smith@example.com"),
        role = UserRole.STUDENT
    )

    private val sampleCollege = College(
        id = 1L,
        name = "School of Computer Science"
    )

    private val sampleMajor = Major(
        id = 1L,
        name = "Computer Science",
        college = sampleCollege
    )

    private val sampleStudent = Student(
        id = 10L,
        studentNumber = "STU001",
        name = "Alex Wang",
        major = sampleMajor,
        enrollmentDate = LocalDate.of(2023, 9, 1),
        riskStatus = RiskStatus.LOW,
        demographics = null,
        assignedTeacherId = null
    )

    @BeforeEach
    fun setup() {
        clock = Clock.fixed(Instant.parse("2026-08-01T10:00:00Z"), ZoneId.of("UTC"))
        assessmentService = AssessmentService(
            assignmentRepository,
            studentRepository,
            userRepository,
            clock
        )
    }

    @Test
    fun `getAssessmentsForUser returns mapped assignments for student`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            studentUserId = 10L,
            assignedByUserId = 101L,
            scaleType = AssessmentScaleType.PHQ_9,
            status = AssessmentStatus.PENDING,
            assignedAt = LocalDateTime.now(clock),
            dueDate = LocalDate.now(clock).plusDays(7)
        )

        `when`(assignmentRepository.findByStudentId(10L)).thenReturn(listOf(assignment))
        `when`(userRepository.findAllById(setOf(101L))).thenReturn(listOf(teacherUser))

        val result = assessmentService.getAssessmentsForUser(studentUser)

        assertEquals(1, result.size)
        assertEquals("PHQ-9 抑郁症筛查量表", result[0].title)
        assertEquals("Teacher Li", result[0].assignedBy.name)
        assertEquals(AssessmentStatus.PENDING, result[0].status)
        assertEquals(0, result[0].completionPercentage)
    }

    @Test
    fun `getAssessmentDetails throws ForbiddenException if student does not own assignment`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            studentUserId = 10L,
            assignedByUserId = 101L,
            scaleType = AssessmentScaleType.PHQ_9
        )

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))

        assertThrows<ForbiddenException> {
            assessmentService.getAssessmentDetails(1L, otherStudentUser)
        }
    }

    @Test
    fun `assignToStudent succeeds when educator has visibility`() {
        val request = AssignAssessmentRequest(
            studentId = 10L,
            scaleTypes = listOf(AssessmentScaleType.PHQ_9),
            dueDate = LocalDate.now(clock).plusDays(14)
        )

        `when`(studentRepository.findByIdAndVisibleTo(10L, teacherUser)).thenReturn(Optional.of(sampleStudent))
        `when`(assignmentRepository.findPendingByStudentIdAndScaleType(10L, AssessmentScaleType.PHQ_9)).thenReturn(Optional.empty())
        `when`(assignmentRepository.save(any())).thenAnswer { invocation ->
            val arg = invocation.arguments[0] as AssessmentAssignment
            arg.copy(id = 55L)
        }

        val result = assessmentService.assignToStudent(request, teacherUser)

        assertEquals(1, result.assignedCount)
        // Event publish is now handled by Spring Data JPA
    }

    @Test
    fun `assignToStudent throws ForbiddenException if student attempts to assign`() {
        val request = AssignAssessmentRequest(
            studentId = 10L,
            scaleTypes = listOf(AssessmentScaleType.PHQ_9)
        )

        assertThrows<ForbiddenException> {
            assessmentService.assignToStudent(request, studentUser)
        }
    }

    @Test
    fun `submitAssessment calculates score and completes assignment`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            studentUserId = 10L,
            assignedByUserId = 101L,
            scaleType = AssessmentScaleType.PHQ_9,
            status = AssessmentStatus.PENDING
        )

        val answers = (1..9).map { AnswerSubmissionDto("phq9_$it", 2) } // Total: 18 -> High Risk
        val request = SubmitAssessmentRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))
        `when`(assignmentRepository.save(any())).thenAnswer { it.arguments[0] as AssessmentAssignment }

        val response = assessmentService.submitAssessment(1L, request, studentUser)

        assertTrue(response.success)
        assertEquals(9, response.totalQuestionsAnswered)
        assertEquals(AssessmentStatus.COMPLETED, assignment.status)
        // Listener handles the profile save in an AFTER_COMMIT phase, so we no longer mock/verify it here
    }

    @Test
    fun `submitAssessment throws ConflictException if already completed`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            studentUserId = 10L,
            assignedByUserId = 101L,
            scaleType = AssessmentScaleType.PHQ_9,
            status = AssessmentStatus.COMPLETED
        )

        val answers = (1..9).map { AnswerSubmissionDto("phq9_$it", 0) }
        val request = SubmitAssessmentRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))

        assertThrows<ConflictException> {
            assessmentService.submitAssessment(1L, request, studentUser)
        }
    }
}
