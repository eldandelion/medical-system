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

    @Mock
    private lateinit var scaleRepository: AssessmentScaleRepository

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

    private val sampleScale = AssessmentScale(
        batteryCode = "MENTAL_HEALTH_ASSESSMENT",
        title = "PHQ-9 抑郁症筛查量表",
        subtitle = "Patient Health Questionnaire-9",
        description = "国际公认的抑郁症状自评筛查量表",
        duration = "5-10 分钟",
        orderNum = 1,
        sections = listOf(
            AssessmentSection(
                code = "phq9",
                title = "情绪状况评估",
                subtitle = "PHQ-9",
                description = "在过去的两周里，您有多少时间受到以下问题的困扰？",
                orderNum = 1,
                questions = (1..9).map {
                    AssessmentQuestion(
                        code = "phq9_$it",
                        text = "Question $it",
                        orderNum = it,
                        optionGroup = AssessmentOptionGroup(
                            name = "phq_options",
                            options = (0..3).map { opt -> AssessmentOption(value = opt, label = "Option $opt") }
                        )
                    )
                }
            )
        )
    )

    @BeforeEach
    fun setup() {
        clock = Clock.fixed(Instant.parse("2026-08-01T10:00:00Z"), ZoneId.of("UTC"))
        assessmentService = AssessmentService(
            assignmentRepository,
            studentRepository,
            userRepository,
            scaleRepository,
            clock
        )
    }

    @Test
    fun `getAssessmentsForUser returns mapped assignments for student`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.PENDING,
            assignedAt = LocalDateTime.now(clock),
            dueDate = LocalDate.now(clock).plusDays(7)
        )

        `when`(assignmentRepository.findByStudentId(10L)).thenReturn(listOf(assignment))
        `when`(userRepository.findAllById(setOf(101L))).thenReturn(listOf(teacherUser))
        `when`(scaleRepository.findAll()).thenReturn(listOf(sampleScale))

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
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT")
        )

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))

        assertThrows<ForbiddenException> {
            assessmentService.getAssessmentDetails(1L, otherStudentUser)
        }
    }

    @Test
    fun `getAssessmentDetails returns details when authorized`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.PENDING
        )

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))
        `when`(scaleRepository.findByBatteryCode("MENTAL_HEALTH_ASSESSMENT")).thenReturn(Optional.of(sampleScale))
        `when`(userRepository.findById(101L)).thenReturn(Optional.of(teacherUser))

        val result = assessmentService.getAssessmentDetails(1L, studentUser)

        assertEquals(1L, result.id)
        assertEquals("PHQ-9 抑郁症筛查量表", result.title)
        assertEquals(1, result.sections.size)
        assertEquals(9, result.requiredQuestionIds.size)
    }

    @Test
    fun `assignToStudent succeeds when educator has visibility`() {
        val request = AssignAssessmentRequest(
            studentId = 10L,
            batteryCodes = listOf("MENTAL_HEALTH_ASSESSMENT"),
            dueDate = LocalDate.now(clock).plusDays(14)
        )

        `when`(studentRepository.findByIdAndVisibleTo(10L, teacherUser)).thenReturn(Optional.of(sampleStudent))
        `when`(assignmentRepository.findPendingByStudentIdAndBatteryCode(10L, "MENTAL_HEALTH_ASSESSMENT")).thenReturn(Optional.empty())
        `when`(assignmentRepository.save(any())).thenAnswer { invocation ->
            val arg = invocation.arguments[0] as AssessmentAssignment
            arg.copy(id = 55L)
        }

        val result = assessmentService.assignToStudent(request, teacherUser)

        assertEquals(1, result.assignedCount)
    }

    @Test
    fun `assignToStudent throws ForbiddenException if student attempts to assign`() {
        val request = AssignAssessmentRequest(
            studentId = 10L,
            batteryCodes = listOf("MENTAL_HEALTH_ASSESSMENT")
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
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.PENDING
        )

        val answers = (1..9).map { AnswerSubmissionDto("phq9_$it", 2) } // Total: 18 -> High Risk
        val request = SubmitAssessmentRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))
        `when`(scaleRepository.findByBatteryCode("MENTAL_HEALTH_ASSESSMENT")).thenReturn(Optional.of(sampleScale))
        `when`(assignmentRepository.save(any())).thenAnswer { it.arguments[0] as AssessmentAssignment }

        val response = assessmentService.submitAssessment(1L, request, studentUser)

        assertTrue(response.success)
        assertEquals(9, response.totalQuestionsAnswered)
        assertEquals(AssessmentStatus.COMPLETED, assignment.status)
    }

    @Test
    fun `submitAssessment throws ConflictException if already completed`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.COMPLETED
        )

        val answers = (1..9).map { AnswerSubmissionDto("phq9_$it", 0) }
        val request = SubmitAssessmentRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))
        `when`(scaleRepository.findByBatteryCode("MENTAL_HEALTH_ASSESSMENT")).thenReturn(Optional.of(sampleScale))

        assertThrows<ConflictException> {
            assessmentService.submitAssessment(1L, request, studentUser)
        }
    }

    @Test
    fun `recordProgress saves draft answers successfully`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.PENDING
        )

        val answers = mapOf("phq9_1" to 2, "phq9_2" to 1)
        val request = com.medicalsystem.backend.dto.RecordProgressRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))

        assessmentService.recordProgress(1L, request, studentUser)

        assertEquals(answers, assignment.answers)
    }

    @Test
    fun `recordProgress throws ForbiddenException for different user`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.PENDING
        )

        val answers = mapOf("phq9_1" to 2)
        val request = com.medicalsystem.backend.dto.RecordProgressRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))

        assertThrows<ForbiddenException> {
            assessmentService.recordProgress(1L, request, otherStudentUser)
        }
    }

    @Test
    fun `recordProgress throws IllegalStateException if already completed`() {
        val assignment = AssessmentAssignment(
            id = 1L,
            studentId = 10L,
            assignedByUserId = 101L,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.COMPLETED
        )

        val answers = mapOf("phq9_1" to 2)
        val request = com.medicalsystem.backend.dto.RecordProgressRequest(answers = answers)

        `when`(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment))

        assertThrows<IllegalStateException> {
            assessmentService.recordProgress(1L, request, studentUser)
        }
    }
}
