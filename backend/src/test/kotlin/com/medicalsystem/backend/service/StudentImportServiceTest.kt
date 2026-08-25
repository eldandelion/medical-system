package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentImportCommitRequestDto
import com.medicalsystem.backend.dto.StudentImportErrorCode
import com.medicalsystem.backend.dto.StudentImportFieldErrorDto
import com.medicalsystem.backend.dto.StudentImportRowDto
import com.medicalsystem.backend.dto.StudentImportStatus
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.repository.MajorJpaRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.TeacherRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.any
import org.mockito.kotlin.never
import org.mockito.kotlin.verify
import org.mockito.kotlin.whenever
import java.time.LocalDate
import java.util.Optional

import org.mockito.quality.Strictness
import org.mockito.junit.jupiter.MockitoSettings

@ExtendWith(MockitoExtension::class)
@MockitoSettings(strictness = Strictness.LENIENT)
class StudentImportServiceTest {

    @Mock private lateinit var majorJpaRepository: MajorJpaRepository
    @Mock private lateinit var degreeLevelJpaRepository: com.medicalsystem.backend.repository.DegreeLevelJpaRepository
    @Mock private lateinit var ethnicityJpaRepository: EthnicityJpaRepository
    @Mock private lateinit var teacherRepository: TeacherRepository
    @Mock private lateinit var studentJpaRepository: StudentJpaRepository
    @Mock private lateinit var userJpaRepository: UserJpaRepository
    @Mock private lateinit var healthProfileRepository: StudentHealthProfileRepository
    @Mock private lateinit var validator: StudentImportValidator
    @Mock private lateinit var eventPublisher: DomainEventPublisher

    @InjectMocks
    private lateinit var service: StudentImportService

    private val college = CollegeEntity(name = "工学院")
    private val majorEntity = MajorEntity(name = "计算机科学", college = college)
    private val ethnicityEntity = EthnicityEntity(name = "汉族")
    private val degreeLevelEntity = com.medicalsystem.backend.entity.DegreeLevelEntity(name = "BACHELOR")
    private val teacherEntity = TeacherEntity(userId = 1L, employeeNumber = "EMP-00001", college = college)

    private val adminUser = User(
        id = 99L,
        name = "Admin",
        email = EmailAddress("admin@test.com"),
        role = UserRole.SYSTEM_ADMIN
    )

    @BeforeEach
    fun setUpCommonMocks() {
        whenever(majorJpaRepository.findAll()).thenReturn(listOf(majorEntity))
        whenever(ethnicityJpaRepository.findAll()).thenReturn(listOf(ethnicityEntity))
        whenever(degreeLevelJpaRepository.findAll()).thenReturn(listOf(degreeLevelEntity))
        whenever(teacherRepository.findAll()).thenReturn(listOf(teacherEntity))
        whenever(studentJpaRepository.findAllStudentNumbers()).thenReturn(emptySet())
    }

    @Test
    fun `generateTemplateCsv returns UTF-8 BOM prefixed CSV`() {
        val bytes = service.generateTemplateCsv()

        // First 3 bytes must be UTF-8 BOM
        assertEquals(0xEF.toByte(), bytes[0])
        assertEquals(0xBB.toByte(), bytes[1])
        assertEquals(0xBF.toByte(), bytes[2])

        val content = String(bytes.drop(3).toByteArray(), Charsets.UTF_8)
        assertTrue(content.contains("学号"), "Template should contain 学号 header")
        assertTrue(content.contains("身份证号"), "Template should contain 身份证号 header")
    }

    @Test
    fun `commitImport throws ForbiddenException for non-admin roles`() {
        val teacherUser = User(
            id = 2L,
            name = "Teacher",
            email = EmailAddress("teacher@test.com"),
            role = UserRole.TEACHER
        )
        val request = StudentImportCommitRequestDto(
            rows = emptyList(),
            overwriteDuplicates = false
        )

        assertThrows(ForbiddenException::class.java) {
            service.commitImport(request, teacherUser)
        }
    }

    @Test
    fun `commitImport with READY rows imports new students and dispatches events`() {
        val savedUser = UserEntity(id = 10L, name = "陈志远", role = UserRole.STUDENT,
            email = EmailAddress("S2026001@univ.edu.cn"))

        whenever(userJpaRepository.save(any<UserEntity>())).thenReturn(savedUser)
        whenever(majorJpaRepository.findByName("计算机科学")).thenReturn(majorEntity)
        whenever(ethnicityJpaRepository.findByName("汉族")).thenReturn(Optional.of(ethnicityEntity))
        whenever(studentJpaRepository.save(any<StudentEntity>())).thenAnswer { it.arguments[0] as StudentEntity }
        whenever(healthProfileRepository.save(any())).thenAnswer { it.arguments[0] }

        val readyRow = StudentImportRowDto(
            rowNumber = 2,
            studentNumber = "S2026001",
            name = "陈志远",
            major = "计算机科学",
            enrollmentDate = LocalDate.of(2026, 9, 1),
            idCardNumber = "110101200801011234",
            gender = "MALE",
            ethnicity = "汉族",
            contactNumber = "13800138000",
            email = "S2026001@univ.edu.cn",
            homeAddress = null,
            emergencyContactName = null,
            emergencyContactPhone = null,
            teacherEmployeeNumber = null,
            status = StudentImportStatus.READY,
            errors = emptyList()
        )

        whenever(validator.validateRows(any(), any(), any(), any(), any(), any()))
            .thenReturn(listOf(readyRow))

        val request = StudentImportCommitRequestDto(
            rows = listOf(readyRow),
            overwriteDuplicates = false
        )

        val result = service.commitImport(request, adminUser)

        assertEquals(1, result.totalProcessed)
        assertEquals(1, result.importedCount)
        assertEquals(0, result.updatedCount)
        assertEquals(0, result.skippedCount)
        assertTrue(result.failedRows.isEmpty())
        verify(eventPublisher).publish(any())
    }

    @Test
    fun `commitImport skips DUPLICATE rows when overwriteDuplicates is false`() {
        val duplicateRow = StudentImportRowDto(
            rowNumber = 2,
            studentNumber = "S2023001",
            name = "李明",
            major = "计算机科学",
            enrollmentDate = LocalDate.of(2023, 9, 1),
            idCardNumber = "110101200401011234",
            gender = "MALE",
            ethnicity = "汉族",
            contactNumber = null,
            email = null,
            homeAddress = null,
            emergencyContactName = null,
            emergencyContactPhone = null,
            teacherEmployeeNumber = null,
            status = StudentImportStatus.DUPLICATE,
            errors = emptyList()
        )

        whenever(validator.validateRows(any(), any(), any(), any(), any(), any()))
            .thenReturn(listOf(duplicateRow))

        val request = StudentImportCommitRequestDto(
            rows = listOf(duplicateRow),
            overwriteDuplicates = false
        )

        val result = service.commitImport(request, adminUser)

        assertEquals(1, result.totalProcessed)
        assertEquals(0, result.importedCount)
        assertEquals(0, result.updatedCount)
        assertEquals(1, result.skippedCount)
        assertTrue(result.failedRows.isEmpty())
        verify(userJpaRepository, never()).save(any<UserEntity>())
    }

    @Test
    fun `commitImport adds INVALID rows to failedRows without persisting`() {
        val invalidRow = StudentImportRowDto(
            rowNumber = 2,
            studentNumber = "BAD",
            name = "",
            major = "非法专业",
            enrollmentDate = null,
            idCardNumber = null,
            gender = null,
            ethnicity = null,
            contactNumber = null,
            email = null,
            homeAddress = null,
            emergencyContactName = null,
            emergencyContactPhone = null,
            teacherEmployeeNumber = null,
            status = StudentImportStatus.INVALID,
            errors = listOf(
                StudentImportFieldErrorDto("major", StudentImportErrorCode.MAJOR_NOT_FOUND, "非法专业")
            )
        )

        whenever(validator.validateRows(any(), any(), any(), any(), any(), any()))
            .thenReturn(listOf(invalidRow))

        val request = StudentImportCommitRequestDto(
            rows = listOf(invalidRow),
            overwriteDuplicates = false
        )

        val result = service.commitImport(request, adminUser)

        assertEquals(1, result.totalProcessed)
        assertEquals(0, result.importedCount)
        assertEquals(1, result.failedRows.size)
        verify(userJpaRepository, never()).save(any<UserEntity>())
    }

    @Test
    fun `commitImport uses HEAD_COUNSELLOR role without throwing`() {
        val counsellorUser = User(
            id = 5L,
            name = "Counsellor",
            email = EmailAddress("hc@test.com"),
            role = UserRole.HEAD_COUNSELLOR
        )
        whenever(validator.validateRows(any(), any(), any(), any(), any(), any()))
            .thenReturn(emptyList())

        val request = StudentImportCommitRequestDto(rows = emptyList(), overwriteDuplicates = false)

        assertDoesNotThrow {
            service.commitImport(request, counsellorUser)
        }
    }
}
