package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDate
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class SearchServiceTest {

    @Mock
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Mock
    private lateinit var referralJpaRepository: ReferralJpaRepository

    @Mock
    private lateinit var assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository

    @Mock
    private lateinit var scaleRepository: AssessmentScaleRepository

    @Mock
    private lateinit var userJpaRepository: UserJpaRepository

    @InjectMocks
    private lateinit var searchService: SearchService

    @Test
    fun `globalSearch returns empty results when query is blank`() {
        val user = User(1L, "Teacher", EmailAddress("t@csu.edu.cn"), null, UserRole.TEACHER)
        val result = searchService.globalSearch("   ", user)

        assertEquals("", result.query)
        assertTrue(result.students.isEmpty())
        assertTrue(result.referrals.isEmpty())
        assertTrue(result.assessments.isEmpty())
    }

    @Test
    fun `globalSearch for Student redacts risk level to null`() {
        val studentUser = User(101L, "Student Li", EmailAddress("li@csu.edu.cn"), null, UserRole.STUDENT)
        val college = CollegeEntity(id = 1L, name = "计算机学院")
        val major = MajorEntity(id = 1L, name = "计算机科学与技术", college = college)
        val studentEntity = StudentEntity(
            id = 101L,
            studentNumber = "2026001",
            name = "Student Li",
            major = major,
            enrollmentDate = LocalDate.of(2026, 9, 1)
        )

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(listOf(studentEntity)))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(scaleRepository.findAll()).thenReturn(emptyList())
        `when`(assessmentAssignmentJpaRepository.findByStudentId(101L)).thenReturn(emptyList())

        val result = searchService.globalSearch("Student", studentUser)

        assertEquals(1, result.students.size)
        assertEquals("Student Li", result.students[0].name)
        assertNull(result.students[0].riskLevel, "Student role must have riskLevel redacted to null")
    }

    @Test
    fun `globalSearch for Student redacts referral riskLevel to null`() {
        val studentUser = User(101L, "Student Li", EmailAddress("li@csu.edu.cn"), null, UserRole.STUDENT)

        val referralEntity = ReferralEntity(
            id = 1L,
            studentId = 101L,
            type = ReferralType.INITIAL,
            title = "情绪低落就诊转诊",
            description = "学生主诉焦虑情绪明显",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = 2L,
            createdAt = LocalDateTime.now()
        )

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(listOf(referralEntity)))
        `when`(studentJpaRepository.findAllById(setOf(101L))).thenReturn(emptyList())
        `when`(scaleRepository.findAll()).thenReturn(emptyList())
        `when`(assessmentAssignmentJpaRepository.findByStudentId(101L)).thenReturn(emptyList())

        val result = searchService.globalSearch("转诊", studentUser)

        assertEquals(1, result.referrals.size)
        assertEquals("情绪低落就诊转诊", result.referrals[0].title)
        assertNull(result.referrals[0].riskLevel, "Student must not see referral risk rating")
    }

    @Test
    fun `globalSearch for Staff searches catalog scales`() {
        val teacherUser = User(2L, "Teacher Wang", EmailAddress("wang@csu.edu.cn"), null, UserRole.TEACHER)

        val phq9 = AssessmentScale(
            batteryCode = "phq-9",
            title = "PHQ-9 抑郁症筛查量表",
            subtitle = "Patient Health Questionnaire",
            description = "Standard depression scale",
            duration = "5-10 min",
            orderNum = 1
        )

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(scaleRepository.findAll()).thenReturn(listOf(phq9))

        val result = searchService.globalSearch("抑郁", teacherUser)

        assertEquals(1, result.assessments.size)
        assertEquals("phq-9", result.assessments[0].batteryCode)
        assertEquals("PHQ-9 抑郁症筛查量表", result.assessments[0].title)
        assertEquals("CATALOG", result.assessments[0].resultType)
    }

    @Test
    fun `globalSearch for Staff preserves referral riskLevel and enriches student and doctor names`() {
        val teacherUser = User(2L, "Teacher Wang", EmailAddress("wang@csu.edu.cn"), null, UserRole.TEACHER)
        val doctorUser = com.medicalsystem.backend.entity.UserEntity(
            id = 55L,
            name = "Dr. Zhao",
            email = EmailAddress("zhao@hospital.org"),
            role = UserRole.DOCTOR
        )

        val destination = com.medicalsystem.backend.entity.ReferralDestinationEntity(
            doctor = com.medicalsystem.backend.entity.DoctorEntity(
                userId = 55L,
                employeeNumber = "DOC-55"
            )
        )

        val college = CollegeEntity(id = 1L, name = "计算机学院")
        val major = MajorEntity(id = 1L, name = "计算机科学与技术", college = college)
        val studentEntity = StudentEntity(
            id = 101L,
            studentNumber = "2026001",
            name = "Student Li",
            major = major,
            enrollmentDate = LocalDate.of(2026, 9, 1)
        )

        val referralEntity = ReferralEntity(
            id = 1L,
            studentId = 101L,
            type = ReferralType.INITIAL,
            title = "就诊转诊",
            description = "跟进中",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = 2L,
            createdAt = LocalDateTime.now(),
            destination = destination
        )

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(listOf(referralEntity)))
        `when`(studentJpaRepository.findAllById(setOf(101L))).thenReturn(listOf(studentEntity))
        `when`(userJpaRepository.findAllById(setOf(55L))).thenReturn(listOf(doctorUser))
        `when`(scaleRepository.findAll()).thenReturn(emptyList())

        val result = searchService.globalSearch("就诊", teacherUser, 10)

        assertEquals(1, result.referrals.size)
        assertEquals(RiskStatus.HIGH, result.referrals[0].riskLevel, "Teacher role must see actual clinical riskLevel")
        assertEquals("Student Li", result.referrals[0].studentName)
        assertEquals("Dr. Zhao", result.referrals[0].destinationDoctorName)
    }

    @Test
    fun `globalSearch for Student searches self assignments matching batteryCode`() {
        val studentUser = User(101L, "Student Li", EmailAddress("li@csu.edu.cn"), null, UserRole.STUDENT)
        val staffUser = com.medicalsystem.backend.entity.UserEntity(
            id = 2L,
            name = "Teacher Wang",
            email = EmailAddress("wang@csu.edu.cn"),
            role = UserRole.TEACHER
        )
        val college = CollegeEntity(id = 1L, name = "计算机学院")
        val major = MajorEntity(id = 1L, name = "计算机科学与技术", college = college)
        val studentEntity = StudentEntity(
            id = 101L,
            studentNumber = "2026001",
            name = "Student Li",
            major = major,
            enrollmentDate = LocalDate.of(2026, 9, 1)
        )

        val assignment = com.medicalsystem.backend.entity.AssessmentAssignmentEntity(
            id = 1L,
            student = studentEntity,
            assignedByUser = staffUser,
            batteryCode = "gad-7",
            status = AssessmentStatus.PENDING,
            dueDate = LocalDate.of(2026, 10, 15)
        )

        val gad7Scale = AssessmentScale(
            batteryCode = "gad-7",
            title = "GAD-7 广泛性焦虑量表",
            subtitle = "Generalized Anxiety Disorder",
            description = "Standard anxiety scale",
            duration = "5 min",
            orderNum = 2
        )

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(scaleRepository.findAll()).thenReturn(listOf(gad7Scale))
        `when`(assessmentAssignmentJpaRepository.findByStudentId(101L)).thenReturn(listOf(assignment))

        val result = searchService.globalSearch("gad", studentUser)

        assertEquals(1, result.assessments.size)
        assertEquals("gad-7", result.assessments[0].batteryCode)
        assertEquals("GAD-7 广泛性焦虑量表", result.assessments[0].title)
        assertEquals("ASSIGNMENT", result.assessments[0].resultType)
        assertEquals("Teacher Wang", result.assessments[0].assignedByName)
        assertEquals(LocalDate.of(2026, 10, 15), result.assessments[0].dueDate)
    }

    @Test
    fun `globalSearch clamps limit between 1 and 20`() {
        val user = User(1L, "Teacher", EmailAddress("t@csu.edu.cn"), null, UserRole.TEACHER)

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(scaleRepository.findAll()).thenReturn(emptyList())

        // Test clamping below 1
        val resultLow = searchService.globalSearch("test", user, limit = -5)
        assertEquals("test", resultLow.query)

        // Test clamping above 20
        val resultHigh = searchService.globalSearch("test", user, limit = 100)
        assertEquals("test", resultHigh.query)
    }

    @Test
    fun `globalSearch for Staff matches scales by subtitle`() {
        val teacherUser = User(2L, "Teacher Wang", EmailAddress("wang@csu.edu.cn"), null, UserRole.TEACHER)

        val gad7 = AssessmentScale(
            batteryCode = "gad-7",
            title = "广泛性焦虑量表",
            subtitle = "Generalized Anxiety Disorder 7",
            description = "Standard anxiety scale",
            duration = "5 min",
            orderNum = 2
        )

        `when`(studentJpaRepository.findAll(any<Specification<StudentEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(referralJpaRepository.findAll(any<Specification<ReferralEntity>>(), any<Pageable>()))
            .thenReturn(PageImpl(emptyList()))
        `when`(scaleRepository.findAll()).thenReturn(listOf(gad7))

        val result = searchService.globalSearch("Generalized", teacherUser)

        assertEquals(1, result.assessments.size)
        assertEquals("gad-7", result.assessments[0].batteryCode)
    }
}
