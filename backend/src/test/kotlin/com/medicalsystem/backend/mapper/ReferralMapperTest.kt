package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.entity.ReferralEntity
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.LocalDateTime
import java.time.LocalDate

class ReferralMapperTest {

    private val mapper = ReferralMapper()

    @Test
    fun `toDto maps domain model to ReferralDto`() {
        val date = LocalDateTime.now()
        val referral = Referral(
            id = 1L,
            studentId = 100L,
            type = ReferralType.EMERGENCY,
            date = date,
            title = "Crisis",
            description = "High risk",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.DRAFT,
            referredById = 200L,
            clinicalStatus = mutableListOf(ClinicalStatusType.FIRST_VISIT),
            severeRiskFactors = mutableListOf(RiskFlagName.SUICIDAL_IDEATION),
            destination = null,
            appointment = null,
            attachments = mutableListOf(),
            steps = mutableListOf()
        )

        val student = Student(
            id = 100L,
            name = "John Doe",
            studentNumber = "12345",
            major = com.medicalsystem.backend.model.Major(1L, "CS", com.medicalsystem.backend.model.College(1L, "Engineering")),
            enrollmentDate = LocalDate.now(),
            riskStatus = RiskStatus.HIGH
        )

        val referredBy = com.medicalsystem.backend.model.User(id = 200L, name = "Jane Smith", email = EmailAddress("jane@example.com"), role = com.medicalsystem.backend.model.UserRole.TEACHER)

        val dto = mapper.toDto(referral, student, referredBy)

        assertEquals("1", dto.id)
        assertEquals(100L, dto.studentId)
        assertEquals("John Doe", dto.studentName)
        assertEquals("12345", dto.studentNumber)
        assertEquals("Crisis", dto.title)
        assertEquals("Jane Smith", dto.referredBy.name)
        assertEquals(0, dto.availableActions.size)
    }

    @Test
    fun `toDetailsDto should map feedback content to summary and leave followUp empty`() {
        val date = LocalDateTime.now()
        val referral = Referral(
            id = 1L,
            studentId = 100L,
            type = ReferralType.EMERGENCY,
            date = date,
            title = "Crisis",
            description = "High risk",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.CLOSED,
            referredById = 200L,
            clinicalStatus = mutableListOf(ClinicalStatusType.FIRST_VISIT),
            severeRiskFactors = mutableListOf(RiskFlagName.SUICIDAL_IDEATION),
            destination = null,
            appointment = null,
            attachments = mutableListOf(),
            steps = mutableListOf(),
            feedback = ReferralFeedback(referralId = 1L, content = "Diagnosis content")
        )

        val student = Student(
            id = 100L,
            name = "John Doe",
            studentNumber = "12345",
            major = com.medicalsystem.backend.model.Major(1L, "CS", com.medicalsystem.backend.model.College(1L, "Engineering")),
            enrollmentDate = LocalDate.now(),
            riskStatus = RiskStatus.HIGH
        )

        val referredBy = com.medicalsystem.backend.model.User(id = 200L, name = "Jane Smith", email = EmailAddress("jane@example.com"), role = com.medicalsystem.backend.model.UserRole.TEACHER)

        val dto = mapper.toDetailsDto(referral, student, referredBy)

        org.junit.jupiter.api.Assertions.assertNotNull(dto.feedback)
        assertEquals("Diagnosis content", dto.feedback?.summary)
        assertEquals("", dto.feedback?.followUp)
    }
}
