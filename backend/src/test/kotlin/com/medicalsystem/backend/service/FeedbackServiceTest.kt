package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.FeedbackAttachmentDto
import com.medicalsystem.backend.dto.FeedbackCreationRequest
import com.medicalsystem.backend.exception.AppError
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ReferralStateException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.event.DomainEventPublisher
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
    private lateinit var referralRepository: ReferralRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var eventPublisher: DomainEventPublisher

    @Mock
    private lateinit var fileApplicationService: com.medicalsystem.backend.storage.service.FileApplicationService

    private lateinit var feedbackService: FeedbackService

    private val doctorId = 2L
    private val referralId = 1L
    private lateinit var doctor: com.medicalsystem.backend.model.User
    private lateinit var validReferral: Referral
    private lateinit var validRequest: FeedbackCreationRequest

    @BeforeEach
    fun setUp() {
        feedbackService = FeedbackService(referralRepository, userRepository, fileApplicationService, eventPublisher)
        doctor = com.medicalsystem.backend.model.User(id = doctorId, name = "Dr. Right", email = com.medicalsystem.backend.model.EmailAddress("right@univ.edu"), role = com.medicalsystem.backend.model.UserRole.DOCTOR)
        
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
            destination = ReferralDestination.Triaged(doctorId = DoctorId(doctorId), departmentId = HospitalDepartmentId(1L), hospitalId = HospitalId(1L), triageAdminId = TriageAdminId(1L), transferDate = null),
            appointment = Appointment(doctorId = doctorId, appointmentTime = java.time.Instant.now(), status = AppointmentStatus.SCHEDULED)
        )

        validRequest = FeedbackCreationRequest(
            referralId = referralId,
            content = "Diagnosis: Stable",
            attachments = listOf(FeedbackAttachmentDto(name = "scan.pdf", sizeBytes = 1024L, fileId = 101L))
        )
    }

    @Test
    fun `Given unassigned doctor, When submitFeedback is called, Then throws ForbiddenException`() {
        val wrongDoctorId = 999L
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))

        assertThrows<ForbiddenException> {
            feedbackService.submitFeedback(validRequest, wrongDoctorId)
        }
        
        verify(referralRepository, never()).save(any())
    }

    @Test
    fun `Given referral not in WAITING_FOR_APPOINTMENT, When submitFeedback is called, Then throws ReferralStateException`() {
        val invalidReferral = Referral(
            id = referralId,
            studentId = 1L,
            type = ReferralType.INITIAL,
            date = java.time.LocalDateTime.now(),
            title = "T",
            description = "R",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.AWAITING_APPROVAL,
            referredById = 3L,
            appointment = Appointment(doctorId = doctorId, appointmentTime = java.time.Instant.now(), status = AppointmentStatus.SCHEDULED)
        )
        
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(invalidReferral))

        assertThrows<ReferralStateException> {
            feedbackService.submitFeedback(validRequest, doctorId)
        }
        
        verify(referralRepository, never()).save(any())
    }

    @Test
    fun `Given negative attachment size, When submitFeedback is called, Then throws IllegalArgumentException`() {
        val invalidRequest = validRequest.copy(
            attachments = listOf(FeedbackAttachmentDto(name = "scan.pdf", sizeBytes = -1L))
        )
        
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))

        assertThrows<IllegalArgumentException> {
            feedbackService.submitFeedback(invalidRequest, doctorId)
        }
        
        verify(referralRepository, never()).save(any())
    }

    @Test
    fun `Given valid payload with attachments, When submitFeedback is called, Then claims files and saves referral`() {
        val mockUploadedFile = com.medicalsystem.backend.storage.entity.UploadedFileEntity(
            id = 101L,
            storageKey = "feedback/test.pdf",
            originalName = "verified_scan.pdf",
            mimeType = "application/pdf",
            sizeBytes = 2048L,
            uploadedById = doctorId,
            category = com.medicalsystem.backend.storage.domain.FileCategory.FEEDBACK_ATTACHMENT,
            status = com.medicalsystem.backend.storage.domain.FileStatus.ACTIVE
        )
        `when`(fileApplicationService.claimFiles(listOf(101L), doctorId)).thenReturn(listOf(mockUploadedFile))
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))
        
        feedbackService.submitFeedback(validRequest, doctorId)

        verify(fileApplicationService).claimFiles(listOf(101L), doctorId)
        val referralCaptor = argumentCaptor<Referral>()
        verify(referralRepository).save(referralCaptor.capture())
        val savedReferral = referralCaptor.firstValue
        
        assertEquals(ReferralStatus.AWAITING_FEEDBACK_APPROVAL, savedReferral.status)
        assertNotNull(savedReferral.feedback)
        assertEquals("Diagnosis: Stable", savedReferral.feedback?.content)
        assertEquals(1, savedReferral.feedback?.attachments?.size)
        assertEquals("verified_scan.pdf", savedReferral.feedback?.attachments?.first()?.file?.name)
        assertEquals(2048L, savedReferral.feedback?.attachments?.first()?.file?.sizeBytes)
        assertEquals(101L, savedReferral.feedback?.attachments?.first()?.fileId)
    }

    @Test
    fun `Given unowned file, When claimFiles throws ForbiddenException, Then referral is not saved`() {
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))
        `when`(fileApplicationService.claimFiles(listOf(101L), doctorId)).thenThrow(ForbiddenException("Cannot claim file not owned by caller"))

        assertThrows<ForbiddenException> {
            feedbackService.submitFeedback(validRequest, doctorId)
        }

        verify(referralRepository, never()).save(any())
    }

    @Test
    fun `Given empty attachments, When submitFeedback is called, Then saves referral without claiming files`() {
        val requestWithoutAttachments = validRequest.copy(attachments = emptyList())
        `when`(referralRepository.findById(referralId)).thenReturn(Optional.of(validReferral))

        feedbackService.submitFeedback(requestWithoutAttachments, doctorId)

        verify(referralRepository).save(any())
        verify(fileApplicationService, never()).claimFiles(any(), any())
    }
}
