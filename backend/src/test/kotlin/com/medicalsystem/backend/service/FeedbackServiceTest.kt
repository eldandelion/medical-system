package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.FeedbackAttachmentDto
import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.exception.AppError
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ReferralStateException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.ReferralFeedbackRepository
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.event.DomainEventPublisher
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.Mockito.verifyNoMoreInteractions
import org.mockito.Mockito.never
import org.mockito.kotlin.any
import org.mockito.kotlin.argumentCaptor
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class FeedbackServiceTest {

    @Mock
    private lateinit var feedbackRepository: ReferralFeedbackRepository

    @Mock
    private lateinit var referralRepository: ReferralRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var eventPublisher: DomainEventPublisher

    @InjectMocks
    private lateinit var feedbackService: FeedbackService

    private val doctorId = 2L
    private val referralId = 1L
    private lateinit var doctor: Doctor
    private lateinit var validReferral: Referral
    private lateinit var validRequest: FeedbackCreationRequest

    @BeforeEach
    fun setUp() {
        doctor = Doctor(id = doctorId, name = "Dr. Right", email = "right@univ.edu", departmentId = 1L, phone = null)
        
        validReferral = Referral(
            id = referralId,
            studentId = 1L,
            type = ReferralType.INITIAL,
            date = java.time.LocalDateTime.now(),
            title = "T",
            description = "R",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = 3L,
            destination = ReferralDestination(doctorId = doctorId, departmentId = null, hospitalId = null, triageAdminId = null, transferDate = null),
            appointment = Appointment(doctorId = doctorId, appointmentTime = java.time.Instant.now(), status = AppointmentStatus.SCHEDULED)
        )

        validRequest = FeedbackCreationRequest(
            referralId = referralId,
            content = "Diagnosis: Stable",
            attachments = listOf(FeedbackAttachmentDto(name = "scan.pdf", sizeBytes = 1024L))
        )
    }

    @AfterEach
    fun tearDown() {
        verifyNoMoreInteractions(feedbackRepository)
    }

    @Test
    fun `Given unassigned doctor, When submitFeedback is called, Then throws ForbiddenException`() {
        // Arrange
        val wrongDoctorId = 999L
        val wrongDoctor = Doctor(id = wrongDoctorId, name = "Dr. Wrong", email = "wrong@univ.edu", departmentId = 1L, phone = null)
        
        `when`(userRepository.findById(wrongDoctorId)).thenReturn(Optional.of(wrongDoctor))
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))

        // Act & Assert
        assertThrows<ForbiddenException> {
            feedbackService.submitFeedback(validRequest, wrongDoctorId)
        }
        
        verify(feedbackRepository, never()).save(any())
    }

    @Test
    fun `Given referral not in WAITING_FOR_APPOINTMENT, When submitFeedback is called, Then throws ReferralStateException`() {
        // Arrange
        val draftReferral = ReferralFactory.createDraft(studentId = 1L, title = "T", reason = "R", riskLevel = RiskStatus.HIGH, referredById = 3L)
        // Set appointment using reflection if needed, but since it's DRAFT it's already invalid state.
        // Wait, if it's DRAFT, it will throw ForbiddenException first because appointment is null!
        // We need to bypass the ForbiddenException. 
        val invalidReferral = Referral(
            id = referralId,
            studentId = 1L,
            type = ReferralType.INITIAL,
            date = java.time.LocalDateTime.now(),
            title = "T",
            description = "R",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.AWAITING_APPROVAL, // Force status using primary constructor
            referredById = 3L,
            appointment = Appointment(doctorId = doctorId, appointmentTime = java.time.Instant.now(), status = AppointmentStatus.SCHEDULED)
        )
        
        `when`(userRepository.findById(doctorId)).thenReturn(Optional.of(doctor))
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(invalidReferral))

        // Act & Assert
        assertThrows<ReferralStateException> {
            feedbackService.submitFeedback(validRequest, doctorId)
        }
        
        verify(feedbackRepository, never()).save(any())
    }

    @Test
    fun `Given negative attachment size, When submitFeedback is called, Then throws IllegalArgumentException`() {
        // Arrange
        val invalidRequest = validRequest.copy(
            attachments = listOf(FeedbackAttachmentDto(name = "scan.pdf", sizeBytes = -1L))
        )
        
        `when`(userRepository.findById(doctorId)).thenReturn(Optional.of(doctor))
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))

        // Act & Assert
        assertThrows<IllegalArgumentException> {
            feedbackService.submitFeedback(invalidRequest, doctorId)
        }
        
        verify(feedbackRepository, never()).save(any())
    }

    @Test
    fun `Given valid payload, When submitFeedback is called, Then successfully saves and transitions state`() {
        // Arrange
        `when`(userRepository.findById(doctorId)).thenReturn(Optional.of(doctor))
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))
        
        val savedFeedback = ReferralFeedback(
            id = 100L,
            referralId = referralId,
            content = validRequest.content,
            attachments = listOf(FeedbackAttachment(id = 1L, name = "scan.pdf", sizeBytes = 1024L, fileUrl = null))
        )
        
        `when`(feedbackRepository.save(any())).thenReturn(savedFeedback)

        // Act
        feedbackService.submitFeedback(validRequest, doctorId)

        // Assert - Feedback Save
        val feedbackCaptor = argumentCaptor<ReferralFeedback>()
        verify(feedbackRepository).save(feedbackCaptor.capture())
        val capturedFeedback = feedbackCaptor.firstValue
        
        assertEquals(referralId, capturedFeedback.referralId)
        assertEquals(validRequest.content, capturedFeedback.content)
        assertEquals(1, capturedFeedback.attachments.size)
        assertEquals("scan.pdf", capturedFeedback.attachments[0].name)
        assertEquals(1024L, capturedFeedback.attachments[0].sizeBytes)

        // Assert - Referral State Transition
        assertEquals(ReferralStatus.AWAITING_FEEDBACK_APPROVAL, validReferral.status)
        
        // Assert - Step Tracking
        val step = validReferral.steps.last()
        assertEquals(ReferralStepType.FEEDBACK, step.type)
        assertEquals(doctorId, step.actorId)
    }
}
