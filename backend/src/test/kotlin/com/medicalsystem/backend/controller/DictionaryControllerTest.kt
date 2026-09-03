package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.service.DictionaryService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpHeaders
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class DictionaryControllerTest {

    @Mock
    private lateinit var dictionaryService: DictionaryService

    @InjectMocks
    private lateinit var dictionaryController: DictionaryController

    @Test
    fun `getEthnicities returns ok with list of ethnicities and cache header`() {
        val mockList = listOf(
            EthnicityDto(id = 1L, name = "汉族"),
            EthnicityDto(id = 2L, name = "蒙古族"),
            EthnicityDto(id = 57L, name = "其他")
        )
        `when`(dictionaryService.getAllEthnicities()).thenReturn(mockList)

        val response = dictionaryController.getEthnicities()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(3, response.body!!.size)
        assertEquals("汉族", response.body!![0].name)
        assertEquals(1L, response.body!![0].id)
        assertNotNull(response.headers.getFirst(HttpHeaders.CACHE_CONTROL))
        assertTrue(response.headers.getFirst(HttpHeaders.CACHE_CONTROL)!!.contains("max-age=86400"))
    }

    @Test
    fun `getSchools returns ok with list of schools and cache header`() {
        val mockList = listOf(
            SchoolDto(id = 1L, name = "中南大学"),
            SchoolDto(id = 2L, name = "湖南大学")
        )
        `when`(dictionaryService.getAllSchools()).thenReturn(mockList)

        val response = dictionaryController.getSchools()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(2, response.body!!.size)
        assertEquals("中南大学", response.body!![0].name)
        assertTrue(response.headers.getFirst(HttpHeaders.CACHE_CONTROL)!!.contains("max-age=86400"))
    }

    @Test
    fun `getSchoolDepartments returns ok with list of departments`() {
        val mockList = listOf(
            SchoolDepartmentDto(id = 10L, name = "计算机学院", schoolId = 1L)
        )
        `when`(dictionaryService.getSchoolDepartments(1L)).thenReturn(mockList)

        val response = dictionaryController.getSchoolDepartments(1L)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(1, response.body!!.size)
        assertEquals("计算机学院", response.body!![0].name)
    }

    @Test
    fun `getHospitals returns ok with list of hospitals and cache header`() {
        val mockList = listOf(
            HospitalSummaryDto(id = 1L, name = "中南大学湘雅医院", address = "开福区", contactPhone = "0731-84328888")
        )
        `when`(dictionaryService.getAllHospitals()).thenReturn(mockList)

        val response = dictionaryController.getHospitals()

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(1, response.body!!.size)
        assertEquals("中南大学湘雅医院", response.body!![0].name)
        assertTrue(response.headers.getFirst(HttpHeaders.CACHE_CONTROL)!!.contains("max-age=86400"))
    }

    @Test
    fun `getHospitalDepartments returns ok with list of hospital departments`() {
        val mockList = listOf(
            HospitalDepartmentDto(id = 5L, name = "精神科", hospitalId = 1L)
        )
        `when`(dictionaryService.getHospitalDepartments(1L)).thenReturn(mockList)

        val response = dictionaryController.getHospitalDepartments(1L)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(1, response.body!!.size)
        assertEquals("精神科", response.body!![0].name)
    }
}
