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
import java.time.LocalDate
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
            batteryCode = "MENTAL_HEALTH_ASSESSMENT",
            completedTests = listOf(
                PsychometricTest(
                    testType = PsychometricTestType.PHQ_9,
                    score = Score(18, 27),
                    testDate = LocalDate.now()
                )
            ),
            completedAt = LocalDateTime.now()
        )

        `when`(studentHealthProfileRepository.findByStudentId(studentId)).thenReturn(Optional.empty())

        listener.handleAssessmentCompleted(event)

        verify(studentHealthProfileRepository).save(any<StudentHealthProfile>())
    }

    @Test
    fun `handleAssessmentCompleted updates existing health profile`() {
        val studentId = 1L
        val profile = StudentHealthProfileFactory.createInitialProfile(studentId)
        
        val event = AssessmentCompletedEvent(
            assignmentId = 100L,
            studentId = studentId,
            batteryCode = "MENTAL_HEALTH_ASSESSMENT",
            completedTests = listOf(
                PsychometricTest(
                    testType = PsychometricTestType.PHQ_9,
                    score = Score(25, 27),
                    testDate = LocalDate.now()
                )
            ),
            completedAt = LocalDateTime.now()
        )

        `when`(studentHealthProfileRepository.findByStudentId(studentId)).thenReturn(Optional.of(profile))

        listener.handleAssessmentCompleted(event)

        assertTrue(profile.psychometricTests.isNotEmpty())
        assertEquals(PsychometricTestType.PHQ_9, profile.psychometricTests.first().testType)
        verify(studentHealthProfileRepository).save(profile)
    }
}

