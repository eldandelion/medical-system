package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.SaveCollegeRequest
import com.medicalsystem.backend.dto.SaveMajorRequest
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.event.CollegeStatusChangedEvent
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class AcademicReferenceServiceTest {

    @Mock private lateinit var collegeJpaRepository: CollegeJpaRepository
    @Mock private lateinit var majorJpaRepository: MajorJpaRepository
    @Mock private lateinit var schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository
    @Mock private lateinit var schoolJpaRepository: SchoolJpaRepository
    @Mock private lateinit var teacherJpaRepository: TeacherJpaRepository
    @Mock private lateinit var studentJpaRepository: StudentJpaRepository
    @Mock private lateinit var headCounsellorJpaRepository: HeadCounsellorJpaRepository
    @Mock private lateinit var dependencyAnalyzer: ReferenceDependencyAnalyzer
    @Mock private lateinit var eventPublisher: DomainEventPublisher

    private lateinit var service: AcademicReferenceService

    @BeforeEach
    fun setUp() {
        service = AcademicReferenceService(
            collegeJpaRepository,
            majorJpaRepository,
            schoolDepartmentJpaRepository,
            schoolJpaRepository,
            teacherJpaRepository,
            studentJpaRepository,
            headCounsellorJpaRepository,
            dependencyAnalyzer,
            eventPublisher
        )
    }

    @Test
    fun `createCollege creates active college when name is unique`() {
        whenever(collegeJpaRepository.findByName("计算机学院")).thenReturn(null)
        val saved = CollegeEntity(id = 1L, name = "计算机学院", status = ReferenceDataStatus.ACTIVE)
        whenever(collegeJpaRepository.save(any<CollegeEntity>())).thenReturn(saved)

        val result = service.createCollege(SaveCollegeRequest("计算机学院"))

        assertEquals(1L, result.id)
        assertEquals("计算机学院", result.name)
        assertEquals(ReferenceDataStatus.ACTIVE, result.status)
    }

    @Test
    fun `createCollege throws ConflictException on duplicate name`() {
        whenever(collegeJpaRepository.findByName("计算机学院")).thenReturn(CollegeEntity(id = 1L, name = "计算机学院"))

        assertThrows(ConflictException::class.java) {
            service.createCollege(SaveCollegeRequest("计算机学院"))
        }
    }

    @Test
    fun `setCollegeStatus updates status and publishes CollegeStatusChangedEvent`() {
        val college = CollegeEntity(id = 1L, name = "计算机学院", status = ReferenceDataStatus.ACTIVE)
        whenever(collegeJpaRepository.findById(1L)).thenReturn(Optional.of(college))
        whenever(collegeJpaRepository.save(any<CollegeEntity>())).thenReturn(college)

        val result = service.setCollegeStatus(1L, ReferenceDataStatus.DEPRECATED)

        assertEquals(ReferenceDataStatus.DEPRECATED, result.status)
        verify(eventPublisher).publish(org.mockito.kotlin.argThat {
            this is CollegeStatusChangedEvent && this.collegeId == 1L && this.newStatus == ReferenceDataStatus.DEPRECATED
        })
    }

    @Test
    fun `createMajor under deprecated college throws ConflictException`() {
        val deprecatedCollege = CollegeEntity(id = 1L, name = "已停用学院", status = ReferenceDataStatus.DEPRECATED)
        whenever(collegeJpaRepository.findById(1L)).thenReturn(Optional.of(deprecatedCollege))

        assertThrows(ConflictException::class.java) {
            service.createMajor(SaveMajorRequest("新专业", 1L))
        }
    }
}
