package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.EmailOtpService
import com.medicalsystem.backend.service.StaffRegistrationService
import com.medicalsystem.backend.service.UserVerificationService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class AuthControllerTest {

    @Mock
    private lateinit var userVerificationService: UserVerificationService

    @Mock
    private lateinit var emailOtpService: EmailOtpService

    @Mock
    private lateinit var staffRegistrationService: StaffRegistrationService

    @InjectMocks
    private lateinit var authController: AuthController

    @Test
    fun `verifyIdentifier returns ok with verification response`() {
        val request = VerifyIdentifierRequest("liming@univ.edu.cn")
        val expectedResponse = VerifyIdentifierResponse(
            exists = true,
            isAccountActive = true,
            status = AccountStatus.ACTIVE,
            maskedIdentifier = "li***g@univ.edu.cn",
            role = UserRole.STUDENT
        )

        `when`(userVerificationService.verifyIdentifier(request)).thenReturn(expectedResponse)

        val response = authController.verifyIdentifier(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertTrue(response.body!!.exists)
        assertTrue(response.body!!.isAccountActive)
        assertEquals(UserRole.STUDENT, response.body!!.role)
        assertEquals(AccountStatus.ACTIVE, response.body!!.status)
    }

    @Test
    fun `verifyIdentifier returns ok with exists false when not found`() {
        val request = VerifyIdentifierRequest("unknown@univ.edu.cn")
        val expectedResponse = VerifyIdentifierResponse(exists = false)

        `when`(userVerificationService.verifyIdentifier(request)).thenReturn(expectedResponse)

        val response = authController.verifyIdentifier(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.exists)
    }

    @Test
    fun `sendEmailOtp returns cooldown seconds`() {
        val request = SendEmailOtpRequest("teacher@csu.edu.cn")
        `when`(emailOtpService.sendOtp("teacher@csu.edu.cn")).thenReturn(60)

        val response = authController.sendEmailOtp(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(60, response.body!!.cooldownSeconds)
    }

    @Test
    fun `register returns created staff details with PENDING_APPROVAL status`() {
        val request = RegisterStaffRequest(
            role = UserRole.TEACHER,
            name = "张老师",
            gender = Gender.MALE,
            dateOfBirth = "2000-01-01",
            ethnicity = "汉族",
            school = "中南大学",
            department = "计算机学院",
            workerNumber = "TEA-001",
            idCardNumber = "110101200001011232",
            email = "teacher@csu.edu.cn",
            emailOtp = "123456",
            password = "Password123"
        )
        val expectedResponse = RegisterResponse(
            userId = 999L,
            email = "teacher@csu.edu.cn",
            name = "张老师",
            role = UserRole.TEACHER,
            status = AccountStatus.PENDING_APPROVAL
        )

        `when`(staffRegistrationService.registerStaff(request)).thenReturn(expectedResponse)

        val response = authController.register(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(999L, response.body!!.userId)
        assertEquals("teacher@csu.edu.cn", response.body!!.email)
        assertEquals(AccountStatus.PENDING_APPROVAL, response.body!!.status)
    }
}

