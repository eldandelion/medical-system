package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.service.NotificationService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.time.LocalDate
import java.time.LocalDateTime
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class AssessmentEventListenerTest {

    @Mock
    private lateinit var notificationService: NotificationService

    @Mock
    private lateinit var studentRepository: StudentRepository

    private lateinit var assessmentEventListener: AssessmentEventListener

    @BeforeEach
    fun setUp() {
        assessmentEventListener = AssessmentEventListener(
            notificationService = notificationService,
            studentRepository = studentRepository
        )
    }

    @Test
    fun `handleAssessmentAssigned saves notification for student`() {
        val student = mock<Student>()
        whenever(student.id).thenReturn(42L)
        whenever(studentRepository.findById(42L)).thenReturn(Optional.of(student))

        val event = AssessmentAssignedEvent(
            assignmentId = 101L,
            studentId = 42L,
            assignedByUserId = 1L,
            batteryCode = "PHQ-9"
        )

        assessmentEventListener.handleAssessmentAssigned(event)

        val captor = argumentCaptor<Notification>()
        verify(notificationService).saveNotification(captor.capture())

        val notification = captor.firstValue
        assertEquals(42L, notification.userId)
        assertEquals(NotificationMessageCode.ASSESSMENT_ASSIGNED_STUDENT, notification.messageCode)
        assertEquals(NotificationActionType.START_ASSESSMENT, notification.actionType)
        assertEquals(101L, notification.actionTargetId)
    }

    @Test
    fun `handleAssessmentCompleted notifies teacher and does NOT notify head counsellor`() {
        val student = mock<Student>()
        whenever(student.id).thenReturn(42L)
        whenever(student.name).thenReturn("王同学")
        whenever(student.assignedTeacherId).thenReturn(88L)
        whenever(studentRepository.findById(42L)).thenReturn(Optional.of(student))

        val completedTest = PsychometricTest(
            studentId = 42L,
            testType = PsychometricTestType.PHQ_9,
            score = Score(points = 25, max = 27),
            testDate = LocalDate.now()
        )

        val event = AssessmentCompletedEvent(
            assignmentId = 202L,
            studentId = 42L,
            batteryCode = "PHQ9",
            completedTests = listOf(completedTest),
            completedAt = LocalDateTime.now()
        )

        assessmentEventListener.handleAssessmentCompleted(event)

        val captor = argumentCaptor<Notification>()
        verify(notificationService, times(1)).saveNotification(captor.capture())

        val notification = captor.firstValue
        assertEquals(88L, notification.userId)
        assertEquals(NotificationMessageCode.ASSESSMENT_COMPLETED_TEACHER, notification.messageCode)
        assertEquals("42", notification.payload["studentId"])
        assertEquals("王同学", notification.payload["studentName"])
        assertEquals("PHQ9", notification.payload["batteryCode"])
        // Ensure heuristic isHighRisk / level are removed
        assertNull(notification.payload["isHighRisk"])
        assertNull(notification.payload["level"])

        // Head counsellor must NOT be notified by AssessmentEventListener
        verify(notificationService, never()).saveNotification(
            check { assertEquals(NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_HC, it.messageCode) }
        )
    }
}
