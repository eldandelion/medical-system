package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class DictionaryServiceTest {

    @Mock
    private lateinit var ethnicityJpaRepository: EthnicityJpaRepository

    @Mock
    private lateinit var schoolJpaRepository: SchoolJpaRepository

    @Mock
    private lateinit var schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository

    @Mock
    private lateinit var hospitalRepository: HospitalRepository

    @Mock
    private lateinit var hospitalDepartmentRepository: HospitalDepartmentRepository

    @InjectMocks
    private lateinit var dictionaryService: DictionaryService

    @Test
    fun `getAllEthnicities returns mapped and sorted list of ethnicities`() {
        val entities = listOf(
            EthnicityEntity(id = 2L, name = "蒙古族"),
            EthnicityEntity(id = 1L, name = "汉族")
        )
        `when`(ethnicityJpaRepository.findAll()).thenReturn(entities)

        val result = dictionaryService.getAllEthnicities()

        assertEquals(2, result.size)
        assertEquals(1L, result[0].id)
        assertEquals("汉族", result[0].name)
        assertEquals(2L, result[1].id)
        assertEquals("蒙古族", result[1].name)
    }

    @Test
    fun `getAllSchools returns mapped and sorted list of schools`() {
        val entities = listOf(
            SchoolEntity(id = 2L, name = "湖南大学"),
            SchoolEntity(id = 1L, name = "中南大学")
        )
        `when`(schoolJpaRepository.findAll()).thenReturn(entities)

        val result = dictionaryService.getAllSchools()

        assertEquals(2, result.size)
        assertEquals(1L, result[0].id)
        assertEquals("中南大学", result[0].name)
        assertEquals(2L, result[1].id)
        assertEquals("湖南大学", result[1].name)
    }

    @Test
    fun `getSchoolDepartments with schoolId filters by schoolId`() {
        val school = SchoolEntity(id = 1L, name = "中南大学")
        val entities = listOf(
            SchoolDepartmentEntity(id = 10L, name = "计算机学院", school = school),
            SchoolDepartmentEntity(id = 11L, name = "湘雅医学院", school = school)
        )
        `when`(schoolDepartmentJpaRepository.findBySchoolIdOrderByIdAsc(1L)).thenReturn(entities)

        val result = dictionaryService.getSchoolDepartments(1L)

        assertEquals(2, result.size)
        assertEquals(10L, result[0].id)
        assertEquals("计算机学院", result[0].name)
        assertEquals(1L, result[0].schoolId)
    }

    @Test
    fun `getAllHospitals returns mapped and sorted list of hospitals`() {
        val entities = listOf(
            HospitalEntity(id = 2L, name = "湘雅二医院", address = "芙蓉区", contactPhone = "0731-85295888"),
            HospitalEntity(id = 1L, name = "湘雅医院", address = "开福区", contactPhone = "0731-84328888")
        )
        `when`(hospitalRepository.findAll()).thenReturn(entities)

        val result = dictionaryService.getAllHospitals()

        assertEquals(2, result.size)
        assertEquals(1L, result[0].id)
        assertEquals("湘雅医院", result[0].name)
        assertEquals("开福区", result[0].address)
        assertEquals("0731-84328888", result[0].contactPhone)
    }

    @Test
    fun `getHospitalDepartments with hospitalId filters by hospitalId`() {
        val hospital = HospitalEntity(id = 1L, name = "湘雅医院")
        val entities = listOf(
            HospitalDepartmentEntity(id = 5L, name = "精神科", hospital = hospital),
            HospitalDepartmentEntity(id = 6L, name = "心理咨询科", hospital = hospital)
        )
        `when`(hospitalDepartmentRepository.findByHospitalIdOrderByIdAsc(1L)).thenReturn(entities)

        val result = dictionaryService.getHospitalDepartments(1L)

        assertEquals(2, result.size)
        assertEquals(5L, result[0].id)
        assertEquals("精神科", result[0].name)
        assertEquals(1L, result[0].hospitalId)
    }
}
