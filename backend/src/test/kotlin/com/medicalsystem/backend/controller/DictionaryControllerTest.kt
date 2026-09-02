package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.EthnicityDto
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
}
