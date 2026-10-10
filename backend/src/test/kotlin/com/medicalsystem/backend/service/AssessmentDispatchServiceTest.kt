package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.ParticipationRecordDto
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.AssessmentAssignmentJpaRepository
import com.medicalsystem.backend.repository.AssessmentDispatchJpaRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.springframework.data.domain.PageImpl
import org.springframework.data.domain.PageRequest
import org.springframework.data.jpa.domain.Specification
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class AssessmentDispatchServiceTest {

    @Mock
    private lateinit var dispatchRepository: AssessmentDispatchJpaRepository

    @Mock
    private lateinit var assignmentRepository: AssessmentAssignmentJpaRepository

    @InjectMocks
    private lateinit var assessmentDispatchService: AssessmentDispatchService

    @Test
    fun `getParticipationRecords should return DTO with assessmentName and dispatchedAt`() {
        val dispatchTime = LocalDateTime.of(2026, 10, 10, 10, 0)
        
        val mockStudent = mock(StudentEntity::class.java)
        `when`(mockStudent.name).thenReturn("John Doe")
        `when`(mockStudent.studentNumber).thenReturn("12345")
        
        val mockDispatch = mock(AssessmentDispatchEntity::class.java)
        `when`(mockDispatch.dispatchedAt).thenReturn(dispatchTime)

        val mockAssignment = mock(AssessmentAssignmentEntity::class.java)
        `when`(mockAssignment.id).thenReturn(100L)
        `when`(mockAssignment.student).thenReturn(mockStudent)
        `when`(mockAssignment.dispatch).thenReturn(mockDispatch)
        `when`(mockAssignment.status).thenReturn(AssessmentStatus.PENDING)
        `when`(mockAssignment.severity).thenReturn(ResultSeverity.PENDING)
        `when`(mockAssignment.batteryCode).thenReturn("PHQ-9")
        
        val page = PageImpl(listOf(mockAssignment))
        `when`(assignmentRepository.findAll(any<Specification<AssessmentAssignmentEntity>>(), any<PageRequest>())).thenReturn(page)

        val result = assessmentDispatchService.getParticipationRecords(null, null, null, null, PageRequest.of(0, 10))

        assertEquals(1, result.content.size)
        val dto = result.content[0]
        assertEquals("PHQ-9", dto.assessmentName)
        assertEquals(dispatchTime, dto.dispatchedAt)
    }
}
