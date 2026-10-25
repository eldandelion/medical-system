package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.College
import com.medicalsystem.backend.model.Major
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.StudentHealthProfile
import com.medicalsystem.backend.repository.DegreeLevelJpaRepository
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.repository.SchoolJpaRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import com.medicalsystem.backend.repository.TeacherRepository
import com.medicalsystem.backend.service.StudentRiskEvaluator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class StudentMapperTest {

    @Mock
    private lateinit var majorMapper: MajorMapper

    @Mock
    private lateinit var degreeLevelRepository: DegreeLevelJpaRepository

    @Mock
    private lateinit var ethnicityRepository: EthnicityJpaRepository

    @Mock
    private lateinit var schoolRepository: SchoolJpaRepository

    @Mock
    private lateinit var healthProfileRepository: StudentHealthProfileRepository

    @Mock
    private lateinit var teacherRepository: TeacherRepository

    private val riskEvaluator = StudentRiskEvaluator()

    private lateinit var studentMapper: StudentMapper

    @BeforeEach
    fun setUp() {
        studentMapper = StudentMapper(
            majorMapper = majorMapper,
            degreeLevelRepository = degreeLevelRepository,
            ethnicityRepository = ethnicityRepository,
            schoolRepository = schoolRepository,
            healthProfileRepository = healthProfileRepository,
            teacherRepository = teacherRepository,
            riskEvaluator = riskEvaluator
        )
    }

    @Test
    fun `toModel preserves HIGH riskStatus from StudentHealthProfile`() {
        val collegeEntity = CollegeEntity(id = 1L, name = "计算机学院")
        val majorEntity = MajorEntity(id = 10L, name = "计算机科学", college = collegeEntity)
        val studentEntity = StudentEntity(
            id = 42L,
            studentNumber = "20250042",
            name = "测试学生",
            major = majorEntity,
            enrollmentDate = LocalDate.of(2025, 9, 1)
        )

        val profile = StudentHealthProfile(
            id = 100L,
            studentId = 42L,
            scidDiagnosis = null,
            riskStatus = RiskStatus.HIGH,
            riskFlags = mutableListOf(),
            psychometricTests = mutableListOf()
        )

        `when`(majorMapper.toModel(majorEntity)).thenReturn(
            Major(id = 10L, name = "计算机科学", college = College(id = 1L, name = "计算机学院"))
        )
        `when`(healthProfileRepository.findByStudentId(42L)).thenReturn(Optional.of(profile))

        val model = studentMapper.toModel(studentEntity)

        assertEquals(RiskStatus.HIGH, model.riskStatus)
    }

    @Test
    fun `toModel safely handles malformed contact numbers without throwing exception`() {
        val collegeEntity = CollegeEntity(id = 1L, name = "计算机学院")
        val majorEntity = MajorEntity(id = 10L, name = "计算机科学", college = collegeEntity)
        val studentEntity = StudentEntity(
            id = 43L,
            studentNumber = "20250043",
            name = "测试学生2",
            major = majorEntity,
            enrollmentDate = LocalDate.of(2025, 9, 1),
            demographics = StudentDemographicsEntity(
                contactNumber = "invalid-phone-format"
            )
        )

        `when`(majorMapper.toModel(majorEntity)).thenReturn(
            Major(id = 10L, name = "计算机科学", college = College(id = 1L, name = "计算机学院"))
        )
        `when`(healthProfileRepository.findByStudentId(43L)).thenReturn(Optional.empty())

        val model = studentMapper.toModel(studentEntity)

        assertEquals(RiskStatus.LOW, model.riskStatus)
        assertNull(model.demographics?.contactNumber)
    }
}
