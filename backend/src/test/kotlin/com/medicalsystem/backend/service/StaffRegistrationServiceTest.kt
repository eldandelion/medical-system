package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.RegisterStaffRequest
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.StaffRegisteredEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*


@ExtendWith(MockitoExtension::class)
class StaffRegistrationServiceTest {

    @Mock private lateinit var userJpaRepository: UserJpaRepository
    @Mock private lateinit var teacherJpaRepository: TeacherJpaRepository
    @Mock private lateinit var doctorRepository: DoctorRepository
    @Mock private lateinit var headCounsellorJpaRepository: HeadCounsellorJpaRepository
    @Mock private lateinit var trialAdminJpaRepository: TrialAdminJpaRepository
    @Mock private lateinit var collegeJpaRepository: CollegeJpaRepository
    @Mock private lateinit var hospitalRepository: HospitalRepository
    @Mock private lateinit var hospitalDepartmentRepository: HospitalDepartmentRepository
    @Mock private lateinit var schoolJpaRepository: SchoolJpaRepository
    @Mock private lateinit var schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository
    @Mock private lateinit var emailOtpService: EmailOtpService
    @Mock private lateinit var domainEventPublisher: DomainEventPublisher

    private lateinit var staffRegistrationService: StaffRegistrationService

    // Valid Chinese ID Card: 110101200001011232 (Male, DOB: 2000-01-01)
    private val validMaleIdCard = "110101200001011232"

    @BeforeEach
    fun setUp() {
        staffRegistrationService = StaffRegistrationService(
            userJpaRepository,
            teacherJpaRepository,
            doctorRepository,
            headCounsellorJpaRepository,
            trialAdminJpaRepository,
            collegeJpaRepository,
            hospitalRepository,
            hospitalDepartmentRepository,
            schoolJpaRepository,
            schoolDepartmentJpaRepository,
            emailOtpService,
            domainEventPublisher
        )
    }

    @Test
    fun `registerStaff successfully registers Teacher with PENDING_APPROVAL status and publishes event`() {
        val request = RegisterStaffRequest(
            role = UserRole.TEACHER,
            name = "张老师",
            gender = Gender.MALE,
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            school = "中南大学",
            department = "计算机学院",
            workerNumber = "TEA-2026-001",
            idCardNumber = validMaleIdCard,
            email = "teacher.zhang@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )

        val college = CollegeEntity(id = 1L, name = "计算机学院")
        whenever(collegeJpaRepository.findByName("计算机学院")).thenReturn(college)
        whenever(teacherJpaRepository.save(any())).thenAnswer { it.arguments[0] as TeacherEntity }
        whenever(userJpaRepository.existsByEmail(EmailAddress("teacher.zhang@csu.edu.cn"))).thenReturn(false)
        whenever(teacherJpaRepository.findByEmployeeNumber("TEA-2026-001")).thenReturn(null)

        val savedUser = UserEntity(
            id = 101L,
            name = "张老师",
            email = EmailAddress("teacher.zhang@csu.edu.cn"),
            role = UserRole.TEACHER,
            status = AccountStatus.PENDING_APPROVAL
        )
        whenever(userJpaRepository.save(any())).thenReturn(savedUser)
        whenever(emailOtpService.verifyAndConsume(any(), any())).thenReturn(true)

        val response = staffRegistrationService.registerStaff(request)

        assertEquals(101L, response.userId)
        assertEquals("teacher.zhang@csu.edu.cn", response.email)
        assertEquals("张老师", response.name)
        assertEquals(UserRole.TEACHER, response.role)
        assertEquals(AccountStatus.PENDING_APPROVAL, response.status)

        verify(emailOtpService).verifyAndConsume("teacher.zhang@csu.edu.cn", "123456")
        verify(teacherJpaRepository).save(any<TeacherEntity>())

        val eventCaptor = argumentCaptor<StaffRegisteredEvent>()
        verify(domainEventPublisher).publish(eventCaptor.capture())
        val publishedEvent = eventCaptor.firstValue
        assertEquals(101L, publishedEvent.userId)
        assertEquals(UserRole.TEACHER, publishedEvent.role)
        assertEquals(AccountStatus.PENDING_APPROVAL, publishedEvent.status)
    }

    @Test
    fun `registerStaff rejects student role`() {
        val request = RegisterStaffRequest(
            role = UserRole.STUDENT,
            name = "学生张三",
            gender = Gender.MALE,
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            workerNumber = "STU-001",
            idCardNumber = validMaleIdCard,
            email = "student@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )

        val ex = assertThrows<ValidationException> {
            staffRegistrationService.registerStaff(request)
        }
        assertEquals("STUDENT_REGISTRATION_NOT_ALLOWED", ex.message)
    }

    @Test
    fun `registerStaff rejects invalid ID card number`() {
        val request = RegisterStaffRequest(
            role = UserRole.TEACHER,
            name = "李老师",
            gender = Gender.MALE,
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            workerNumber = "TEA-002",
            idCardNumber = "123456",
            email = "li@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )

        val ex = assertThrows<ValidationException> {
            staffRegistrationService.registerStaff(request)
        }
        assertEquals("INVALID_ID_CARD", ex.message)
    }

    @Test
    fun `registerStaff rejects ID card gender mismatch`() {
        val request = RegisterStaffRequest(
            role = UserRole.TEACHER,
            name = "王老师",
            gender = Gender.FEMALE, // Mismatches Male ID card
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            workerNumber = "TEA-003",
            idCardNumber = validMaleIdCard,
            email = "wang@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )

        val ex = assertThrows<ValidationException> {
            staffRegistrationService.registerStaff(request)
        }
        assertEquals("ID_CARD_GENDER_MISMATCH", ex.message)
    }

    @Test
    fun `registerStaff rejects duplicate email`() {
        val request = RegisterStaffRequest(
            role = UserRole.TEACHER,
            name = "张老师",
            gender = Gender.MALE,
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            workerNumber = "TEA-004",
            idCardNumber = validMaleIdCard,
            email = "existing@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )

        whenever(userJpaRepository.existsByEmail(EmailAddress("existing@csu.edu.cn"))).thenReturn(true)

        val ex = assertThrows<ConflictException> {
            staffRegistrationService.registerStaff(request)
        }
        assertEquals("EMAIL_ALREADY_EXISTS", ex.message)
    }

    @Test
    fun `registerStaff rejects duplicate worker number`() {
        val request = RegisterStaffRequest(
            role = UserRole.TEACHER,
            name = "张老师",
            gender = Gender.MALE,
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            workerNumber = "TEA-DUPLICATE",
            idCardNumber = validMaleIdCard,
            email = "newteacher@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )

        whenever(userJpaRepository.existsByEmail(EmailAddress("newteacher@csu.edu.cn"))).thenReturn(false)
        whenever(teacherJpaRepository.findByEmployeeNumber("TEA-DUPLICATE")).thenReturn(mock<TeacherEntity>())

        val ex = assertThrows<ConflictException> {
            staffRegistrationService.registerStaff(request)
        }
        assertEquals("WORKER_NUMBER_ALREADY_EXISTS", ex.message)
    }
}

