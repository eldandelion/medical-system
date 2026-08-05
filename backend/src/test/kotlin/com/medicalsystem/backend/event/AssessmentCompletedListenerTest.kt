package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class AssessmentCompletedListenerTest {

    @Mock
    private lateinit var studentHealthProfileRepository: StudentHealthProfileRepository

    @InjectMocks
    private lateinit var listener: AssessmentCompletedListener

    @Test
    fun `handleAssessmentCompleted saves new health profile`() {
        val studentId = 1L
        val event = AssessmentCompletedEvent(
            assignmentId = 100L,
            studentId = studentId,
            studentUserId = 10L,
            scaleType = AssessmentScaleType.MENTAL_HEALTH_ASSESSMENT,
            totalScore = 18,
            maxScore = 27,
            level = "中重度抑郁",
            isHighRisk = true,
            crisisFlags = listOf("重度抑郁倾向"),
            completedAt = LocalDateTime.now()
        )

        `when`(studentHealthProfileRepository.findByStudentId(studentId)).thenReturn(Optional.empty())

        listener.handleAssessmentCompleted(event)

        verify(studentHealthProfileRepository).save(any<StudentHealthProfile>())
    }

    @Test
    fun `handleAssessmentCompleted updates existing health profile`() {
        val studentId = 1L
        val profile = StudentHealthProfileFactory.createInitialProfile(studentId, RiskStatus.LOW)
        
        val event = AssessmentCompletedEvent(
            assignmentId = 100L,
            studentId = studentId,
            studentUserId = 10L,
            scaleType = AssessmentScaleType.MENTAL_HEALTH_ASSESSMENT,
            totalScore = 18,
            maxScore = 27,
            level = "中重度抑郁",
            isHighRisk = true,
            crisisFlags = listOf("重度抑郁倾向"),
            completedAt = LocalDateTime.now()
        )

        `when`(studentHealthProfileRepository.findByStudentId(studentId)).thenReturn(Optional.of(profile))

        listener.handleAssessmentCompleted(event)

        assertEquals(RiskStatus.HIGH, profile.riskStatus)
        assertTrue(profile.psychometricTests.isNotEmpty())
        assertEquals(TestResultName.MENTAL_HEALTH_ASSESSMENT, profile.psychometricTests.first().testResultName)
        verify(studentHealthProfileRepository).save(profile)
    }
}
