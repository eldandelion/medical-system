package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.mapper.ReferralMapper
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.exception.ResourceNotFoundException
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.mockito.Mockito.*
import org.mockito.kotlin.mock
import org.mockito.kotlin.whenever
import org.mockito.kotlin.any
import org.mockito.kotlin.argThat
import java.time.LocalDateTime
import java.util.Optional

class ReferralServiceTest {

    private val referralRepository: ReferralRepository = mock()
    private val studentRepository: StudentRepository = mock()
    private val referralMapper: ReferralMapper = mock()
    
    private val referralService = ReferralService(
        referralRepository,
        studentRepository,
        referralMapper
    )

    private val mockMajor: MajorEntity = mock()

    private val mockStudent = StudentEntity(
        id = 1L,
        name = "John Doe",
        studentNumber = "12345",
        major = mockMajor,
        enrollmentDate = java.time.LocalDate.now(),
        riskStatus = com.medicalsystem.backend.model.RiskStatus.LOW
    )

    private val mockReferralEntity = ReferralEntity(
        id = 100L,
        student = mockStudent,
        type = com.medicalsystem.backend.model.ReferralType.INITIAL,
        title = "Test Title",
        description = "Test Desc",
        riskLevel = com.medicalsystem.backend.model.RiskStatus.LOW,
        status = ReferralStatus.AWAITING_APPROVAL,
        referredByName = "SYSTEM",
        createdAt = LocalDateTime.now()
    )

    private val mockReferralDto: ReferralDto = mock()

    @Test
    fun `getReferralById_WhenExists_ReturnsDto`() {
        // Arrange
        val id = 100L
        whenever(referralRepository.findById(id)).thenReturn(Optional.of(mockReferralEntity))
        whenever(referralMapper.toDto(mockReferralEntity)).thenReturn(mockReferralDto)

        // Act
        val result = referralService.getReferralById(id)

        // Assert
        assertEquals(mockReferralDto, result)
        verify(referralRepository).findById(id)
        verify(referralMapper).toDto(mockReferralEntity)
    }

    @Test
    fun `getReferralById_WhenNotFound_ThrowsResourceNotFoundException`() {
        // Arrange
        val id = 999L
        whenever(referralRepository.findById(id)).thenReturn(Optional.empty())

        // Act & Assert
        assertThrows<ResourceNotFoundException> {
            referralService.getReferralById(id)
        }
        verify(referralRepository).findById(id)
    }

    @Test
    fun `createReferral_WhenActionIsDraft_SavesAsDraft`() {
        // Arrange
        val dto = CreateReferralDto(
            studentId = 1L,
            title = "New Title",
            reason = "New Reason",
            riskLevel = com.medicalsystem.backend.model.RiskStatus.HIGH,
            actionType = ReferralService.ACTION_DRAFT
        )
        whenever(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent))
        whenever(referralRepository.save(any())).thenReturn(mockReferralEntity)
        whenever(referralMapper.toDto(mockReferralEntity)).thenReturn(mockReferralDto)

        // Act
        val result = referralService.createReferral(dto)

        // Assert
        assertEquals(mockReferralDto, result)
        verify(referralRepository).save(argThat { entity ->
            entity.status == ReferralStatus.DRAFT &&
            entity.title == "New Title" &&
            entity.type == com.medicalsystem.backend.model.ReferralType.INITIAL &&
            entity.referredByName == ReferralService.SYSTEM_USER
        })
    }

    @Test
    fun `createReferral_WhenActionIsSubmit_SavesAsAwaitingApproval`() {
        // Arrange
        val dto = CreateReferralDto(
            studentId = 1L,
            title = "Submit Title",
            reason = "Submit Reason",
            riskLevel = com.medicalsystem.backend.model.RiskStatus.MEDIUM,
            actionType = "submit" // not draft
        )
        whenever(studentRepository.findById(1L)).thenReturn(Optional.of(mockStudent))
        whenever(referralRepository.save(any())).thenReturn(mockReferralEntity)
        whenever(referralMapper.toDto(mockReferralEntity)).thenReturn(mockReferralDto)

        // Act
        val result = referralService.createReferral(dto)

        // Assert
        assertEquals(mockReferralDto, result)
        verify(referralRepository).save(argThat { entity ->
            entity.status == ReferralStatus.AWAITING_APPROVAL
        })
    }
}
