package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.mock.web.MockMultipartFile

@ExtendWith(MockitoExtension::class)
class ReferenceDataImportServiceTest {

    @Mock private lateinit var collegeJpaRepository: CollegeJpaRepository
    @Mock private lateinit var majorJpaRepository: MajorJpaRepository
    @Mock private lateinit var schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository
    @Mock private lateinit var hospitalRepository: HospitalRepository
    @Mock private lateinit var hospitalDepartmentRepository: HospitalDepartmentRepository
    @Mock private lateinit var ethnicityJpaRepository: EthnicityJpaRepository
    @Mock private lateinit var degreeLevelJpaRepository: DegreeLevelJpaRepository
    @Mock private lateinit var academicReferenceService: AcademicReferenceService
    @Mock private lateinit var clinicalReferenceService: ClinicalReferenceService
    @Mock private lateinit var demographicsReferenceService: DemographicsReferenceService

    private lateinit var importService: ReferenceDataImportService

    @BeforeEach
    fun setUp() {
        importService = ReferenceDataImportService(
            collegeJpaRepository,
            majorJpaRepository,
            schoolDepartmentJpaRepository,
            hospitalRepository,
            hospitalDepartmentRepository,
            ethnicityJpaRepository,
            degreeLevelJpaRepository,
            academicReferenceService,
            clinicalReferenceService,
            demographicsReferenceService
        )
    }

    @Test
    fun `generateTemplateCsv returns UTF8 BOM prefixed CSV template`() {
        val bytes = importService.generateTemplateCsv(ReferenceCategory.COLLEGE)
        assertTrue(bytes.size > 3)
        assertEquals(0xEF.toByte(), bytes[0])
        assertEquals(0xBB.toByte(), bytes[1])
        assertEquals(0xBF.toByte(), bytes[2])
        val text = String(bytes.copyOfRange(3, bytes.size), Charsets.UTF_8)
        assertTrue(text.contains("学院名称"))
    }

    @Test
    fun `previewCsv identifies ready, duplicate, and invalid rows for majors`() {
        val existingCollege = CollegeEntity(id = 1L, name = "计算机学院", status = ReferenceDataStatus.ACTIVE)
        whenever(collegeJpaRepository.findAll()).thenReturn(listOf(existingCollege))
        whenever(majorJpaRepository.findAll()).thenReturn(emptyList())

        val csvContent = "专业名称,所属学院\n软件工程,计算机学院\n,计算机学院\n自动化,不存在的学院\n"
        val file = MockMultipartFile("file", "test.csv", "text/csv", csvContent.toByteArray(Charsets.UTF_8))

        val preview = importService.previewCsv(ReferenceCategory.MAJOR, file)

        assertEquals(3, preview.totalRows)
        assertEquals(1, preview.readyCount)
        assertEquals(2, preview.invalidCount)
        assertEquals("READY", preview.rows[0].status)
        assertEquals("INVALID", preview.rows[1].status) // empty name
        assertEquals("INVALID", preview.rows[2].status) // parent not found
    }
}
