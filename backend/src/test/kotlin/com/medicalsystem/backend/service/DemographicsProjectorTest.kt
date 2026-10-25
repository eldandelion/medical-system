package com.medicalsystem.backend.service

import com.medicalsystem.backend.config.AssessmentCatalogLoader
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDate
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class DemographicsProjectorTest {

    @Mock
    private lateinit var ethnicityJpaRepository: EthnicityJpaRepository

    private lateinit var catalogLoader: AssessmentCatalogLoader
    private lateinit var projector: DemographicsProjector

    @BeforeEach
    fun setUp() {
        catalogLoader = AssessmentCatalogLoader()
        catalogLoader.init()
        projector = DemographicsProjector(catalogLoader, ethnicityJpaRepository)
    }

    @Test
    fun `projectDemographics maps G4 value 2 (少数民族) to 其他 when 少数民族 is not in DB instead of 汉族`() {
        val hanEntity = EthnicityEntity(id = 1L, name = "汉族")
        val otherEntity = EthnicityEntity(id = 57L, name = "其他")

        `when`(ethnicityJpaRepository.findByName("少数民族")).thenReturn(Optional.empty())
        `when`(ethnicityJpaRepository.findByName("其他")).thenReturn(Optional.of(otherEntity))

        val college = CollegeEntity(id = 1L, name = "计算机学院")
        val major = MajorEntity(id = 1L, name = "计算机科学", college = college)
        val student = StudentEntity(
            id = 1L,
            studentNumber = "20250001",
            name = "张同学",
            major = major,
            enrollmentDate = LocalDate.of(2025, 9, 1)
        )

        projector.projectDemographics(student, mapOf("G4" to 2))

        assertEquals("其他", student.demographics?.ethnicity?.name)
    }

    @Test
    fun `projectDemographics maps G4 value 2 (少数民族) to 少数民族 when present in DB`() {
        val minorityEntity = EthnicityEntity(id = 58L, name = "少数民族")
        `when`(ethnicityJpaRepository.findByName("少数民族")).thenReturn(Optional.of(minorityEntity))

        val college = CollegeEntity(id = 1L, name = "计算机学院")
        val major = MajorEntity(id = 1L, name = "计算机科学", college = college)
        val student = StudentEntity(
            id = 1L,
            studentNumber = "20250001",
            name = "张同学",
            major = major,
            enrollmentDate = LocalDate.of(2025, 9, 1)
        )

        projector.projectDemographics(student, mapOf("G4" to 2))

        assertEquals("少数民族", student.demographics?.ethnicity?.name)
    }
}
