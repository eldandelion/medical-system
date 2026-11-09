package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import org.junit.jupiter.api.Assertions.assertDoesNotThrow
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class StudentHealthProfileRiskListenerTest {

    @Mock
    private lateinit var healthProfileRepository: StudentHealthProfileRepository

    @Mock
    private lateinit var referralRepository: ReferralRepository

    @InjectMocks
    private lateinit var listener: StudentHealthProfileRiskListener

    private val studentId = 81L
    private val referralId = 501L

    @Test
    fun `onReferralInitiated raises profile risk when referral risk is higher`() {
        val referral = mock<Referral>()
        whenever(referral.riskLevel).thenReturn(RiskStatus.HIGH)
        whenever(referralRepository.findById(referralId)).thenReturn(Optional.of(referral))

        val profile = mock<StudentHealthProfile>()
        whenever(profile.riskStatus).thenReturn(RiskStatus.LOW)
        whenever(healthProfileRepository.findByStudentId(studentId)).thenReturn(Optional.of(profile))

        listener.onReferralInitiated(
            ReferralInitiatedEvent(
                referralId = referralId,
                studentId = studentId,
                initiatorId = 16L
            )
        )

        verify(profile).riskStatus = RiskStatus.HIGH
        verify(healthProfileRepository).save(profile)
    }

    @Test
    fun `onReferralInitiated does not lower profile risk when referral risk is lower`() {
        val referral = mock<Referral>()
        whenever(referral.riskLevel).thenReturn(RiskStatus.LOW)
        whenever(referralRepository.findById(referralId)).thenReturn(Optional.of(referral))

        val profile = mock<StudentHealthProfile>()
        whenever(profile.riskStatus).thenReturn(RiskStatus.HIGH)
        whenever(healthProfileRepository.findByStudentId(studentId)).thenReturn(Optional.of(profile))

        listener.onReferralInitiated(
            ReferralInitiatedEvent(
                referralId = referralId,
                studentId = studentId,
                initiatorId = 16L
            )
        )

        verify(profile, never()).riskStatus = any()
        verify(healthProfileRepository, never()).save(any())
    }

    @Test
    fun `onStudentRegistered executes safely without exceptions`() {
        assertDoesNotThrow {
            listener.onStudentRegistered(
                StudentRegisteredEvent(
                    studentId = studentId,
                    riskLevel = "LOW"
                )
            )
        }
    }
}
