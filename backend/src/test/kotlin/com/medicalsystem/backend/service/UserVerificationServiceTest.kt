package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.VerifyIdentifierRequest
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.Instant
import java.time.LocalDate
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class UserVerificationServiceTest {

    @Mock
    private lateinit var userJpaRepository: UserJpaRepository

    @Mock
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Mock
    private lateinit var teacherJpaRepository: TeacherJpaRepository

    @Mock
    private lateinit var doctorRepository: DoctorRepository

    @Mock
    private lateinit var headCounsellorJpaRepository: HeadCounsellorJpaRepository

    @Mock
    private lateinit var trialAdminJpaRepository: TrialAdminJpaRepository

    @InjectMocks
    private lateinit var userVerificationService: UserVerificationService

    @Test
    fun `verifyIdentifier with blank input returns exists false`() {
        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("   "))
        assertFalse(result.exists)
    }

    @Test
    fun `verifyIdentifier with email resolves active user successfully`() {
        val user = UserEntity(
            id = 1L,
            name = "李明",
            email = EmailAddress("liming@univ.edu.cn"),
            role = UserRole.STUDENT,
            status = AccountStatus.ACTIVE
        )
        `when`(userJpaRepository.findAll()).thenReturn(listOf(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("liming@univ.edu.cn"))

        assertTrue(result.exists)
        assertTrue(result.isAccountActive)
        assertEquals(UserRole.STUDENT, result.role)
        assertNotNull(result.maskedIdentifier)
    }

    @Test
    fun `verifyIdentifier with student number resolves user successfully`() {
        val studentEntity = StudentEntity(
            id = 2L,
            studentNumber = "S2023001",
            name = "王芳",
            major = MajorEntity(id = 1L, name = "计算机科学", college = CollegeEntity(id = 1L, name = "计算机学院")),
            enrollmentDate = LocalDate.of(2023, 9, 1)
        )
        val user = UserEntity(
            id = 2L,
            name = "王芳",
            email = EmailAddress("wangfang@univ.edu.cn"),
            role = UserRole.STUDENT,
            status = AccountStatus.ACTIVE
        )

        `when`(studentJpaRepository.findByStudentNumber("S2023001")).thenReturn(studentEntity)
        `when`(userJpaRepository.findById(2L)).thenReturn(Optional.of(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("S2023001"))

        assertTrue(result.exists)
        assertTrue(result.isAccountActive)
        assertEquals(UserRole.STUDENT, result.role)
    }

    @Test
    fun `verifyIdentifier with teacher employee number resolves teacher successfully`() {
        val teacherEntity = TeacherEntity(
            userId = 3L,
            employeeNumber = "EMP-00001",
            college = CollegeEntity(id = 1L, name = "医学院")
        )
        val user = UserEntity(
            id = 3L,
            name = "艾米丽·沃森",
            email = EmailAddress("emily@univ.edu.cn"),
            role = UserRole.TEACHER,
            status = AccountStatus.ACTIVE
        )

        `when`(studentJpaRepository.findByStudentNumber("EMP-00001")).thenReturn(null)
        `when`(teacherJpaRepository.findByEmployeeNumber("EMP-00001")).thenReturn(teacherEntity)
        `when`(userJpaRepository.findById(3L)).thenReturn(Optional.of(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("EMP-00001"))

        assertTrue(result.exists)
        assertTrue(result.isAccountActive)
        assertEquals(UserRole.TEACHER, result.role)
    }

    @Test
    fun `verifyIdentifier with doctor employee number resolves doctor successfully`() {
        val doctorEntity = DoctorEntity(
            userId = 4L,
            employeeNumber = "DOC-00001"
        )
        val user = UserEntity(
            id = 4L,
            name = "李医生",
            email = EmailAddress("li@univ.edu.cn"),
            role = UserRole.DOCTOR,
            status = AccountStatus.ACTIVE
        )

        `when`(studentJpaRepository.findByStudentNumber("DOC-00001")).thenReturn(null)
        `when`(teacherJpaRepository.findByEmployeeNumber("DOC-00001")).thenReturn(null)
        `when`(doctorRepository.findByEmployeeNumber("DOC-00001")).thenReturn(doctorEntity)
        `when`(userJpaRepository.findById(4L)).thenReturn(Optional.of(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("DOC-00001"))

        assertTrue(result.exists)
        assertTrue(result.isAccountActive)
        assertEquals(UserRole.DOCTOR, result.role)
    }

    @Test
    fun `verifyIdentifier with head counsellor employee number resolves successfully`() {
        val hcEntity = HeadCounsellorEntity(
            userId = 5L,
            employeeNumber = "HC-00001",
            schoolId = 1L,
            departmentId = 1L
        )
        val user = UserEntity(
            id = 5L,
            name = "王主任",
            email = EmailAddress("wang_head@univ.edu.cn"),
            role = UserRole.HEAD_COUNSELLOR,
            status = AccountStatus.ACTIVE
        )

        `when`(studentJpaRepository.findByStudentNumber("HC-00001")).thenReturn(null)
        `when`(teacherJpaRepository.findByEmployeeNumber("HC-00001")).thenReturn(null)
        `when`(doctorRepository.findByEmployeeNumber("HC-00001")).thenReturn(null)
        `when`(headCounsellorJpaRepository.findByEmployeeNumber("HC-00001")).thenReturn(hcEntity)
        `when`(userJpaRepository.findById(5L)).thenReturn(Optional.of(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("HC-00001"))

        assertTrue(result.exists)
        assertTrue(result.isAccountActive)
        assertEquals(UserRole.HEAD_COUNSELLOR, result.role)
    }

    @Test
    fun `verifyIdentifier with trial admin employee number resolves successfully`() {
        val hospital = HospitalEntity(id = 1L, name = "湘雅医院")
        val taEntity = TrialAdminEntity(
            userId = 6L,
            employeeNumber = "TA-00001",
            hospital = hospital
        )
        val user = UserEntity(
            id = 6L,
            name = "张老师",
            email = EmailAddress("zhang@univ.edu.cn"),
            role = UserRole.TRIAL_ADMIN,
            status = AccountStatus.ACTIVE
        )

        `when`(studentJpaRepository.findByStudentNumber("TA-00001")).thenReturn(null)
        `when`(teacherJpaRepository.findByEmployeeNumber("TA-00001")).thenReturn(null)
        `when`(doctorRepository.findByEmployeeNumber("TA-00001")).thenReturn(null)
        `when`(headCounsellorJpaRepository.findByEmployeeNumber("TA-00001")).thenReturn(null)
        `when`(trialAdminJpaRepository.findByEmployeeNumber("TA-00001")).thenReturn(taEntity)
        `when`(userJpaRepository.findById(6L)).thenReturn(Optional.of(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("TA-00001"))

        assertTrue(result.exists)
        assertTrue(result.isAccountActive)
        assertEquals(UserRole.TRIAL_ADMIN, result.role)
    }

    @Test
    fun `verifyIdentifier with SYS-ADMIN resolves system admin user`() {
        val user = UserEntity(
            id = 99L,
            name = "系统管理员",
            email = EmailAddress("admin@univ.edu.cn"),
            role = UserRole.SYSTEM_ADMIN,
            status = AccountStatus.ACTIVE
        )

        `when`(studentJpaRepository.findByStudentNumber("SYS-ADMIN")).thenReturn(null)
        `when`(teacherJpaRepository.findByEmployeeNumber("SYS-ADMIN")).thenReturn(null)
        `when`(doctorRepository.findByEmployeeNumber("SYS-ADMIN")).thenReturn(null)
        `when`(headCounsellorJpaRepository.findByEmployeeNumber("SYS-ADMIN")).thenReturn(null)
        `when`(trialAdminJpaRepository.findByEmployeeNumber("SYS-ADMIN")).thenReturn(null)
        `when`(userJpaRepository.findAll()).thenReturn(listOf(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("SYS-ADMIN"))

        assertTrue(result.exists)
        assertEquals(UserRole.SYSTEM_ADMIN, result.role)
    }

    @Test
    fun `verifyIdentifier with soft deleted user returns exists false`() {
        val user = UserEntity(
            id = 1L,
            name = "李明",
            email = EmailAddress("liming@univ.edu.cn"),
            role = UserRole.STUDENT,
            status = AccountStatus.DELETED,
            deletedAt = Instant.now()
        )
        `when`(userJpaRepository.findAll()).thenReturn(listOf(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("liming@univ.edu.cn"))

        assertFalse(result.exists)
    }

    @Test
    fun `verifyIdentifier with disabled user returns exists true and isAccountActive false`() {
        val user = UserEntity(
            id = 1L,
            name = "李明",
            email = EmailAddress("liming@univ.edu.cn"),
            role = UserRole.STUDENT,
            status = AccountStatus.DISABLED
        )
        `when`(userJpaRepository.findAll()).thenReturn(listOf(user))

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("liming@univ.edu.cn"))

        assertTrue(result.exists)
        assertFalse(result.isAccountActive)
    }

    @Test
    fun `verifyIdentifier with non existent identifier returns exists false`() {
        `when`(studentJpaRepository.findByStudentNumber("UNKNOWN999")).thenReturn(null)
        `when`(teacherJpaRepository.findByEmployeeNumber("UNKNOWN999")).thenReturn(null)
        `when`(doctorRepository.findByEmployeeNumber("UNKNOWN999")).thenReturn(null)
        `when`(headCounsellorJpaRepository.findByEmployeeNumber("UNKNOWN999")).thenReturn(null)
        `when`(trialAdminJpaRepository.findByEmployeeNumber("UNKNOWN999")).thenReturn(null)

        val result = userVerificationService.verifyIdentifier(VerifyIdentifierRequest("UNKNOWN999"))

        assertFalse(result.exists)
    }
}
