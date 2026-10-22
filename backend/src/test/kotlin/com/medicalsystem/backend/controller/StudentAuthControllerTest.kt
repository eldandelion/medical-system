package com.medicalsystem.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.GlobalExceptionHandler
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.repository.*
import com.medicalsystem.backend.service.OtpPurpose
import com.medicalsystem.backend.service.OtpService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@Transactional
class StudentAuthControllerTest {

    @Autowired
    private lateinit var authController: AuthController

    @Autowired
    private lateinit var otpService: OtpService

    @Autowired
    private lateinit var userJpaRepository: UserJpaRepository

    @Autowired
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Autowired
    private lateinit var studentHealthProfileJpaRepository: StudentHealthProfileJpaRepository

    @Autowired
    private lateinit var assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository

    private lateinit var mockMvc: MockMvc
    private val objectMapper = ObjectMapper()

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
        otpService.clearAllForTesting()
    }

    @Test
    fun `testStudentRegister_Success registers student and assigns intake survey`() {
        val phone = "13800000001"
        val studentNumber = "STU2025001"
        val otpOutcome = otpService.sendOtp(MobileNumber(phone), OtpPurpose.REGISTRATION)
        val code = otpOutcome.devCode!!

        val request = StudentRegisterRequest(
            studentNumber = studentNumber,
            fullName = "王小明",
            phone = phone,
            password = "SecretPassword123",
            verificationCode = code
        )

        mockMvc.perform(
            post("/api/auth/student-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").isString)
            .andExpect(jsonPath("$.student.studentNumber").value(studentNumber))
            .andExpect(jsonPath("$.student.fullName").value("王小明"))
            .andExpect(jsonPath("$.student.phone").value(phone))

        // Verify entities created in DB
        val student = studentJpaRepository.findByStudentNumber(studentNumber)
        assertNotNull(student)
        val user = userJpaRepository.findByPhone(phone)
        assertNotNull(user)
        assertEquals(student?.id, user?.id)

        // Verify Health Profile created
        val profile = studentHealthProfileJpaRepository.findByStudentId(user!!.id)
        assertTrue(profile.isPresent)
        assertEquals(RiskStatus.LOW, profile.get().riskStatus)

        // Verify milestone survey assigned
        val assignments = assessmentAssignmentJpaRepository.findByStudentId(user.id)
        assertTrue(assignments.any { it.batteryCode == "comprehensive_student_intake_survey" })
    }

    @Test
    fun `testStudentRegister_DuplicateIdentifier returns 409 conflict`() {
        val phone = "13800000002"
        val studentNumber = "STU2025002"
        val code = otpService.sendOtp(MobileNumber(phone), OtpPurpose.REGISTRATION).devCode!!

        val request = StudentRegisterRequest(
            studentNumber = studentNumber,
            fullName = "张三",
            phone = phone,
            password = "SecretPassword123",
            verificationCode = code
        )

        mockMvc.perform(
            post("/api/auth/student-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request))
        ).andExpect(status().isOk)

        // Attempt second registration with same student number
        val phone2 = "13800000003"
        val code2 = otpService.sendOtp(MobileNumber(phone2), OtpPurpose.REGISTRATION).devCode!!
        val dupRequest = StudentRegisterRequest(
            studentNumber = studentNumber,
            fullName = "李四",
            phone = phone2,
            password = "SecretPassword123",
            verificationCode = code2
        )

        mockMvc.perform(
            post("/api/auth/student-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dupRequest))
        ).andExpect(status().isConflict)
    }

    @Test
    fun `testDualLogin_StudentNumber logs in successfully`() {
        val phone = "13800000004"
        val studentNumber = "STU2025004"
        val code = otpService.sendOtp(MobileNumber(phone), OtpPurpose.REGISTRATION).devCode!!

        val registerReq = StudentRegisterRequest(
            studentNumber = studentNumber,
            fullName = "赵六",
            phone = phone,
            password = "Password456",
            verificationCode = code
        )
        mockMvc.perform(
            post("/api/auth/student-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq))
        ).andExpect(status().isOk)

        // Login with studentNumber
        val loginReq = LoginRequest(
            identifier = studentNumber,
            password = "Password456"
        )

        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").isString)
            .andExpect(jsonPath("$.student.studentNumber").value(studentNumber))
    }

    @Test
    fun `testDualLogin_Phone logs in successfully`() {
        val phone = "13800000005"
        val studentNumber = "STU2025005"
        val code = otpService.sendOtp(MobileNumber(phone), OtpPurpose.REGISTRATION).devCode!!

        val registerReq = StudentRegisterRequest(
            studentNumber = studentNumber,
            fullName = "钱七",
            phone = phone,
            password = "Password789",
            verificationCode = code
        )
        mockMvc.perform(
            post("/api/auth/student-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq))
        ).andExpect(status().isOk)

        // Login with phone
        val loginReq = LoginRequest(
            identifier = phone,
            password = "Password789"
        )

        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(loginReq))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.token").isString)
            .andExpect(jsonPath("$.student.phone").value(phone))
    }

    @Test
    fun `testLogin_InvalidPassword returns 401 unauthorized`() {
        val phone = "13800000006"
        val studentNumber = "STU2025006"
        val code = otpService.sendOtp(MobileNumber(phone), OtpPurpose.REGISTRATION).devCode!!

        val registerReq = StudentRegisterRequest(
            studentNumber = studentNumber,
            fullName = "孙八",
            phone = phone,
            password = "CorrectPassword",
            verificationCode = code
        )
        mockMvc.perform(
            post("/api/auth/student-register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(registerReq))
        ).andExpect(status().isOk)

        val wrongLoginReq = LoginRequest(
            identifier = studentNumber,
            password = "WrongPassword"
        )

        mockMvc.perform(
            post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(wrongLoginReq))
        ).andExpect(status().isUnauthorized)
    }
}
