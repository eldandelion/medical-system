package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.FeedbackAttachmentDto
import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.service.FeedbackService
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.model.Doctor
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.kotlin.eq
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.junit.jupiter.api.extension.ExtendWith
import org.junit.jupiter.api.Assertions.assertEquals
import org.springframework.http.HttpStatus
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class FeedbackControllerTest {

    @Mock
    private lateinit var feedbackService: FeedbackService

    @InjectMocks
    private lateinit var feedbackController: FeedbackController

    private lateinit var validRequest: FeedbackCreationRequest

    @BeforeEach
    fun setUp() {
        validRequest = FeedbackCreationRequest(
            referralId = 1L,
            content = "Diagnosis: Stable, recommended monthly follow-up.",
            attachments = listOf(FeedbackAttachmentDto(name = "scan.pdf", sizeBytes = 1024L))
        )
    }

    @Test
    fun `Given valid payload, When submitFeedback is called, Then calls service and returns OK`() {
        // Arrange
        val expectedDoctorId = 997L
        val mockDoctor = Doctor(id = expectedDoctorId, name = "Mock Doctor", email = com.medicalsystem.backend.model.EmailAddress("doctor@univ.edu.cn"), employeeNumber = com.medicalsystem.backend.model.HospitalEmployeeId("DOC-001"), departmentId = 1L, phone = null)

        // Act
        val response = feedbackController.submitFeedback(validRequest, mockDoctor)
        
        // Assert
        assertEquals(HttpStatus.OK, response.statusCode)
        verify(feedbackService).submitFeedback(eq(validRequest), eq(expectedDoctorId))
    }
}
