package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceSubjectType
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever

@ExtendWith(MockitoExtension::class)
class ReferenceDependencyAnalyzerTest {

    @Mock private lateinit var majorJpaRepository: MajorJpaRepository
    @Mock private lateinit var teacherJpaRepository: TeacherJpaRepository
    @Mock private lateinit var studentJpaRepository: StudentJpaRepository
    @Mock private lateinit var headCounsellorJpaRepository: HeadCounsellorJpaRepository
    @Mock private lateinit var hospitalDepartmentRepository: HospitalDepartmentRepository
    @Mock private lateinit var trialAdminJpaRepository: TrialAdminJpaRepository
    @Mock private lateinit var referralJpaRepository: ReferralJpaRepository
    @Mock private lateinit var doctorRepository: DoctorRepository
    @Mock private lateinit var schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository

    private lateinit var analyzer: ReferenceDependencyAnalyzer

    @BeforeEach
    fun setUp() {
        analyzer = ReferenceDependencyAnalyzer(
            majorJpaRepository,
            teacherJpaRepository,
            studentJpaRepository,
            headCounsellorJpaRepository,
            hospitalDepartmentRepository,
            trialAdminJpaRepository,
            referralJpaRepository,
            doctorRepository,
            schoolDepartmentJpaRepository
        )
    }

    @Test
    fun `checkDependencies for College with majors and teachers returns cannot hard delete`() {
        whenever(majorJpaRepository.countByCollegeId(1L)).thenReturn(3L)
        whenever(teacherJpaRepository.countByCollegeId(1L)).thenReturn(5L)

        val result = analyzer.checkDependencies(ReferenceCategory.COLLEGE, 1L)

        assertFalse(result.canHardDelete)
        assertEquals(8L, result.totalReferences)
        assertEquals(2, result.dependencies.size)
        assertTrue(result.dependencies.any { it.subjectType == ReferenceSubjectType.MAJOR && it.count == 3L })
        assertTrue(result.dependencies.any { it.subjectType == ReferenceSubjectType.TEACHER && it.count == 5L })
    }

    @Test
    fun `checkDependencies for unreferenced College returns can hard delete`() {
        whenever(majorJpaRepository.countByCollegeId(2L)).thenReturn(0L)
        whenever(teacherJpaRepository.countByCollegeId(2L)).thenReturn(0L)

        val result = analyzer.checkDependencies(ReferenceCategory.COLLEGE, 2L)

        assertTrue(result.canHardDelete)
        assertEquals(0L, result.totalReferences)
        assertTrue(result.dependencies.isEmpty())
    }

    @Test
    fun `checkDependencies for Hospital with departments, admins and referrals`() {
        whenever(hospitalDepartmentRepository.countByHospitalId(10L)).thenReturn(2L)
        whenever(trialAdminJpaRepository.countByHospitalId(10L)).thenReturn(1L)
        whenever(referralJpaRepository.countByDestinationHospitalId(10L)).thenReturn(4L)

        val result = analyzer.checkDependencies(ReferenceCategory.HOSPITAL, 10L)

        assertFalse(result.canHardDelete)
        assertEquals(7L, result.totalReferences)
        assertEquals(3, result.dependencies.size)
    }

    @Test
    fun `checkDependencies for School with departments and students`() {
        whenever(schoolDepartmentJpaRepository.countBySchoolId(100L)).thenReturn(4L)
        whenever(studentJpaRepository.countByDemographicsSchoolId(100L)).thenReturn(50L)

        val result = analyzer.checkDependencies(ReferenceCategory.SCHOOL, 100L)

        assertFalse(result.canHardDelete)
        assertEquals(54L, result.totalReferences)
        assertEquals(2, result.dependencies.size)
        assertTrue(result.dependencies.any { it.subjectType == ReferenceSubjectType.SCHOOL_DEPARTMENT && it.count == 4L })
        assertTrue(result.dependencies.any { it.subjectType == ReferenceSubjectType.STUDENT && it.count == 50L })
    }

    @Test
    fun `checkDependencies for Ethnicity with students`() {
        whenever(studentJpaRepository.countByDemographicsEthnicityId(5L)).thenReturn(12L)

        val result = analyzer.checkDependencies(ReferenceCategory.ETHNICITY, 5L)

        assertFalse(result.canHardDelete)
        assertEquals(12L, result.totalReferences)
        assertEquals(1, result.dependencies.size)
        assertEquals(ReferenceSubjectType.STUDENT, result.dependencies[0].subjectType)
    }
}
