package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.College
import com.medicalsystem.backend.model.Major
import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.StudentHealthProfile
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.repository.DegreeLevelJpaRepository
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.repository.SchoolJpaRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import com.medicalsystem.backend.repository.TeacherRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import com.medicalsystem.backend.service.StudentRiskEvaluator
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.never
import org.mockito.Mockito.verify
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

    @Mock
    private lateinit var userJpaRepository: UserJpaRepository

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
            riskEvaluator = riskEvaluator,
            userJpaRepository = userJpaRepository
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

    @Test
    fun `toModel populates assignedTeacherId and toDto uses batch teacherNameLookup without extra queries`() {
        val collegeEntity = CollegeEntity(id = 1L, name = "计算机学院")
        val majorEntity = MajorEntity(id = 10L, name = "计算机科学", college = collegeEntity)
        val teacherEntity = TeacherEntity(userId = 201L, employeeNumber = "EMP-201", college = collegeEntity)
        val studentEntity = StudentEntity(
            id = 44L,
            studentNumber = "20250044",
            name = "林小夕",
            major = majorEntity,
            enrollmentDate = LocalDate.of(2025, 9, 1),
            assignedTeacher = teacherEntity
        )

        `when`(majorMapper.toModel(majorEntity)).thenReturn(
            Major(id = 10L, name = "计算机科学", college = College(id = 1L, name = "计算机学院"))
        )
        `when`(healthProfileRepository.findByStudentId(44L)).thenReturn(Optional.empty())
        `when`(userJpaRepository.findById(44L)).thenReturn(Optional.empty())

        val model = studentMapper.toModel(studentEntity)
        assertEquals(201L, model.assignedTeacherId)

        val dto = studentMapper.toDto(model, mapOf(201L to "张老师"))
        assertEquals(201L, dto.assignedTeacherId)
        assertEquals("张老师", dto.assignedTeacherName)
        verify(userJpaRepository, never()).findById(201L)
    }

    @Test
    fun `toDto falls back to userJpaRepository when lookup omitted and returns null when unassigned`() {
        val major = Major(id = 10L, name = "计算机科学", college = College(id = 1L, name = "计算机学院"))
        val assignedModel = Student(
            id = 45L,
            studentNumber = "20250045",
            name = "陈墨",
            major = major,
            enrollmentDate = LocalDate.of(2025, 9, 1),
            riskStatus = RiskStatus.LOW,
            demographics = null,
            assignedTeacherId = 202L
        )
        val unassignedModel = assignedModel.copy(id = 46L, studentNumber = "20250046", assignedTeacherId = null)

        val teacherUser = UserEntity(
            id = 202L,
            name = "李导师",
            email = EmailAddress("li@univ.edu.cn"),
            role = UserRole.TEACHER
        )
        `when`(userJpaRepository.findById(202L)).thenReturn(Optional.of(teacherUser))

        val assignedDto = studentMapper.toDto(assignedModel)
        assertEquals(202L, assignedDto.assignedTeacherId)
        assertEquals("李导师", assignedDto.assignedTeacherName)

        val unassignedDto = studentMapper.toDto(unassignedModel)
        assertNull(unassignedDto.assignedTeacherId)
        assertNull(unassignedDto.assignedTeacherName)
    }
}
