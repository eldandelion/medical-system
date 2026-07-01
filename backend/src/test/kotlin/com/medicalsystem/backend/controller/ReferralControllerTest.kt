package com.medicalsystem.backend.controller

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule
import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.dto.ReferredByDto
import com.medicalsystem.backend.exception.GlobalExceptionHandler
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.service.ReferralService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class ReferralControllerTest {

    private lateinit var mockMvc: MockMvc

    @Mock
    private lateinit var referralService: ReferralService

    @InjectMocks
    private lateinit var referralController: ReferralController

    private val objectMapper = ObjectMapper().apply {
        registerModule(JavaTimeModule())
    }

    @BeforeEach
    fun setup() {
        mockMvc = MockMvcBuilders.standaloneSetup(referralController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
    }

    @Test
    fun `should return all referrals`() {
        val referral = ReferralDto(
            id = "1",
            studentName = "John Doe",
            studentNumber = "S123",
            type = ReferralType.INITIAL,
            date = LocalDateTime.now(),
            title = "Anxiety Issue",
            description = "Test",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.AWAITING_APPROVAL,
            referredBy = ReferredByDto("SYSTEM")
        )
        `when`(referralService.getAllReferrals()).thenReturn(listOf(referral))

        mockMvc.perform(get("/api/referrals"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].title").value("Anxiety Issue"))
    }

    @Test
    fun `should create a referral`() {
        val inputDto = CreateReferralDto(
            studentId = 1L,
            actionType = "submit",
            title = "Anxiety Issue",
            reason = "Test reason",
            riskLevel = RiskStatus.HIGH
        )
        val savedDto = ReferralDto(
            id = "1",
            studentName = "John Doe",
            studentNumber = "S123",
            type = ReferralType.INITIAL,
            date = LocalDateTime.now(),
            title = "Anxiety Issue",
            description = "Test reason",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.AWAITING_APPROVAL,
            referredBy = ReferredByDto("SYSTEM")
        )

        `when`(referralService.createReferral(any())).thenReturn(savedDto)

        mockMvc.perform(
            post("/api/referrals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto))
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value("1"))
            .andExpect(jsonPath("$.title").value("Anxiety Issue"))
    }

    @Test
    fun `should return 400 when validation fails on create referral`() {
        // Missing required blank fields (title is blank)
        val inputDto = CreateReferralDto(
            studentId = 1L,
            actionType = "submit",
            title = "",
            reason = "Test reason",
            riskLevel = RiskStatus.HIGH
        )

        mockMvc.perform(
            post("/api/referrals")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(inputDto))
        )
            .andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.error").value("Validation failed"))
    }
}
