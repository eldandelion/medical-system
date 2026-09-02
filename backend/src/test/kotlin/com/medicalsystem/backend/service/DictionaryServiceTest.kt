package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.repository.EthnicityJpaRepository
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
}
