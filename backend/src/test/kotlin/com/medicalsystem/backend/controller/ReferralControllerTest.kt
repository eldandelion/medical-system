package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.service.ReferralService
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.TrialAdmin
import com.medicalsystem.backend.model.EmailAddress
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import org.junit.jupiter.api.Assertions.*

@ExtendWith(MockitoExtension::class)
class ReferralControllerTest {

    @Mock
    private lateinit var referralService: ReferralService

    @InjectMocks
    private lateinit var referralController: ReferralController

    @Test
    fun `scheduleAppointment returns mapped dto`() {
        val dto = com.medicalsystem.backend.dto.ScheduleAppointmentDto(appointmentTime = java.time.LocalDateTime.now().plusDays(1))
        val referralDto = ReferralDto(
            id = "1",
            studentName = "John Doe",
            studentNumber = "STU123",
            type = com.medicalsystem.backend.model.ReferralType.INITIAL,
            date = java.time.LocalDateTime.now(),
            title = "Test",
            description = "Test",
            riskLevel = com.medicalsystem.backend.model.RiskStatus.LOW,
            status = com.medicalsystem.backend.model.ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredBy = com.medicalsystem.backend.dto.ReferredByDto("Teacher"),
            availableActions = emptyList()
        )
        
        val mockUser: User = TrialAdmin(id = 1L, name = "Admin", email = EmailAddress("admin@univ.edu.cn"))
        `when`(referralService.scheduleAppointment(1L, dto, mockUser)).thenReturn(referralDto)

        val result = referralController.scheduleAppointment(1L, dto, mockUser)
        
        assertEquals(com.medicalsystem.backend.model.ReferralStatus.WAITING_FOR_APPOINTMENT, result.status)
        assertEquals("1", result.id)
    }
}
