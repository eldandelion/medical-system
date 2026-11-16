package com.medicalsystem.backend.service

import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.AssessmentAssignmentRepository
import com.medicalsystem.backend.repository.AssessmentDispatchRepository
import com.medicalsystem.backend.repository.AssessmentScaleSettingJpaRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import java.time.LocalDate
import java.util.*

@ExtendWith(MockitoExtension::class)
class AssessmentAssignmentServiceTest {

    @Mock
    private lateinit var assessmentAssignmentRepository: AssessmentAssignmentRepository

    @Mock
    private lateinit var domainEventPublisher: DomainEventPublisher

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var dispatchRepository: AssessmentDispatchRepository

    @Mock
    private lateinit var scaleRepository: AssessmentScaleRepository

    @Mock
    private lateinit var scaleSettingRepository: AssessmentScaleSettingJpaRepository

    @Mock
    private lateinit var userRepository: UserRepository

    private lateinit var service: AssessmentAssignmentService

    private val adminUser = User(
        id = 1L,
        name = "Admin",
        email = EmailAddress("admin@univ.edu.cn"),
        role = UserRole.SYSTEM_ADMIN
    )

    private val studentUser = User(
        id = 20L,
        name = "Test Student",
        email = EmailAddress("2026880401@univ.edu.cn"),
        role = UserRole.STUDENT
    )

    private val sampleStudent = Student(
        id = 20L,
        studentNumber = "2026880401",
        name = "Test Student",
        major = Major(id = 1L, name = "临床医学", college = College(id = 1L, name = "医学院")),
        enrollmentDate = LocalDate.of(2026, 9, 1),
        riskStatus = RiskStatus.LOW
    )

    private val sampleScale = AssessmentScale(
        batteryCode = "comprehensive_student_intake_survey",
        title = "中南大学学生心身健康综合调查问卷",
        subtitle = "普查",
        description = "desc",
        duration = "45 分钟",
        orderNum = 1,
        sections = emptyList()
    )

    @BeforeEach
    fun setUp() {
        service = AssessmentAssignmentService(
            assessmentAssignmentRepository = assessmentAssignmentRepository,
            domainEventPublisher = domainEventPublisher,
            studentRepository = studentRepository,
            dispatchRepository = dispatchRepository,
            scaleRepository = scaleRepository,
            scaleSettingRepository = scaleSettingRepository,
            userRepository = userRepository
        )
    }

    @Test
    fun `assignAssessment upgrades self-seeded pending registration assignment instead of duplicating`() {
        val selfSeeded = AssessmentAssignment(
            id = 9L,
            studentId = 20L,
            assignedByUserId = 20L,
            batteryCode = BatteryId("comprehensive_student_intake_survey"),
            dispatchId = null,
            status = AssessmentStatus.PENDING
        )

        `when`(scaleRepository.findByBatteryCode("comprehensive_student_intake_survey")).thenReturn(Optional.of(sampleScale))
        `when`(scaleSettingRepository.findById("comprehensive_student_intake_survey")).thenReturn(Optional.empty())
        `when`(studentRepository.findByIdAndVisibleTo(20L, adminUser)).thenReturn(Optional.of(sampleStudent))
        `when`(assessmentAssignmentRepository.findByStudentIdAndStatus(20L, AssessmentStatus.PENDING)).thenReturn(listOf(selfSeeded))
        `when`(dispatchRepository.save(any())).thenAnswer { (it.arguments[0] as AssessmentDispatch).copy(id = 50L) }
        `when`(assessmentAssignmentRepository.save(any())).thenAnswer { it.arguments[0] as AssessmentAssignment }

        val saved = service.assignAssessment(20L, adminUser, "comprehensive_student_intake_survey")

        assertEquals(9L, saved.id)
        assertEquals(1L, saved.assignedByUserId)
        assertEquals(50L, saved.dispatchId)
        verify(domainEventPublisher).publish(any())
    }

    @Test
    fun `assignAssessment throws ConflictException when already dispatched pending assignment exists`() {
        val existingDispatched = AssessmentAssignment(
            id = 10L,
            studentId = 20L,
            assignedByUserId = 1L,
            batteryCode = BatteryId("comprehensive_student_intake_survey"),
            dispatchId = 50L,
            status = AssessmentStatus.PENDING
        )

        `when`(scaleRepository.findByBatteryCode("comprehensive_student_intake_survey")).thenReturn(Optional.of(sampleScale))
        `when`(scaleSettingRepository.findById("comprehensive_student_intake_survey")).thenReturn(Optional.empty())
        `when`(studentRepository.findByIdAndVisibleTo(20L, adminUser)).thenReturn(Optional.of(sampleStudent))
        `when`(assessmentAssignmentRepository.findByStudentIdAndStatus(20L, AssessmentStatus.PENDING)).thenReturn(listOf(existingDispatched))

        assertThrows<ConflictException> {
            service.assignAssessment(20L, adminUser, "comprehensive_student_intake_survey")
        }
    }

    @Test
    fun `assignAssessment rejects student caller and disabled scale`() {
        assertThrows<ForbiddenException> {
            service.assignAssessment(20L, studentUser, "comprehensive_student_intake_survey")
        }

        `when`(scaleRepository.findByBatteryCode("comprehensive_student_intake_survey")).thenReturn(Optional.of(sampleScale))
        `when`(scaleSettingRepository.findById("comprehensive_student_intake_survey")).thenReturn(
            Optional.of(com.medicalsystem.backend.entity.AssessmentScaleSettingEntity("comprehensive_student_intake_survey", false))
        )

        assertThrows<ValidationException> {
            service.assignAssessment(20L, adminUser, "comprehensive_student_intake_survey")
        }
    }
}
