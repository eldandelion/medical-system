package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.LoginSmsRequest
import com.medicalsystem.backend.dto.SendCodeRequest
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.exception.UnauthorizedException
import com.medicalsystem.backend.infrastructure.sms.MockSmsSender
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.AssessmentAssignmentJpaRepository
import com.medicalsystem.backend.repository.CollegeJpaRepository
import com.medicalsystem.backend.repository.MajorJpaRepository
import com.medicalsystem.backend.repository.StudentHealthProfileJpaRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import com.medicalsystem.backend.security.JwtService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class AuthServiceSmsTest {

    @Mock
    private lateinit var userJpaRepository: UserJpaRepository

    @Mock
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Mock
    private lateinit var majorJpaRepository: MajorJpaRepository

    @Mock
    private lateinit var collegeJpaRepository: CollegeJpaRepository

    @Mock
    private lateinit var studentHealthProfileJpaRepository: StudentHealthProfileJpaRepository

    @Mock
    private lateinit var assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository

    private lateinit var otpService: OtpService
    private lateinit var authService: AuthService

    @BeforeEach
    fun setUp() {
        otpService = OtpService(MockSmsSender())
        val jwtService = JwtService("test-jwt-secret-key-at-least-48-bytes-long-for-hs384-signing")
        authService = AuthService(
            userJpaRepository = userJpaRepository,
            studentJpaRepository = studentJpaRepository,
            majorJpaRepository = majorJpaRepository,
            collegeJpaRepository = collegeJpaRepository,
            studentHealthProfileJpaRepository = studentHealthProfileJpaRepository,
            assessmentAssignmentJpaRepository = assessmentAssignmentJpaRepository,
            otpService = otpService,
            jwtService = jwtService,
            passwordEncoder = BCryptPasswordEncoder()
        )
    }

    private fun userWithStatus(status: AccountStatus, role: UserRole = UserRole.STUDENT): UserEntity =
        UserEntity(
            id = 42L,
            name = "测试用户",
            role = role,
            email = EmailAddress("user42@univ.edu.cn"),
            status = status,
            phone = "13800138042"
        )

    @Test
    fun `sendVerificationCode LOGIN rejects DISABLED, PENDING_APPROVAL and DELETED users`() {
        val phone = "13800138042"
        for (status in listOf(AccountStatus.DISABLED, AccountStatus.PENDING_APPROVAL, AccountStatus.DELETED)) {
            `when`(userJpaRepository.findByPhone(phone)).thenReturn(userWithStatus(status))
            assertThrows<UnauthorizedException>("Expected rejection for status $status") {
                authService.sendVerificationCode(SendCodeRequest(phone = phone, purpose = "LOGIN"))
            }
        }
    }

    @Test
    fun `loginWithSms rejects DISABLED, PENDING_APPROVAL and DELETED users even with valid OTP`() {
        val phone = "13800138042"
        for (status in listOf(AccountStatus.DISABLED, AccountStatus.PENDING_APPROVAL, AccountStatus.DELETED)) {
            otpService.clearAllForTesting()
            val code = otpService.sendOtp(MobileNumber(phone), OtpPurpose.LOGIN).devCode!!
            `when`(userJpaRepository.findByPhone(phone)).thenReturn(userWithStatus(status))

            assertThrows<UnauthorizedException>("Expected login rejection for status $status") {
                authService.loginWithSms(LoginSmsRequest(phone = phone, code = code))
            }
        }
    }

    @Test
    fun `loginWithSms for TEACHER returns role TEACHER and null student`() {
        val phone = "13800138042"
        val teacherUser = userWithStatus(AccountStatus.ACTIVE, role = UserRole.TEACHER)
        val code = otpService.sendOtp(MobileNumber(phone), OtpPurpose.LOGIN).devCode!!
        `when`(userJpaRepository.findByPhone(phone)).thenReturn(teacherUser)
        `when`(studentJpaRepository.findById(42L)).thenReturn(Optional.empty())

        val res = authService.loginWithSms(LoginSmsRequest(phone = phone, code = code))

        assertEquals(UserRole.TEACHER, res.role)
        assertEquals("测试用户", res.name)
        assertNotNull(res.token)
        assertNull(res.student)
    }
}
