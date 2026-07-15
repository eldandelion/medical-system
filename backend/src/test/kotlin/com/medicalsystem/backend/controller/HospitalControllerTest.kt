package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.HospitalDto
import com.medicalsystem.backend.service.HospitalService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension

@ExtendWith(MockitoExtension::class)
class HospitalControllerTest {

    @Mock
    private lateinit var hospitalService: HospitalService

    @InjectMocks
    private lateinit var hospitalController: HospitalController

    @Test
    fun `should return list of hospitals with hasTrialAdmin flag`() {
        val hospitals = listOf(
            HospitalDto(id = 1L, name = "Hospital A", address = "Address A", contactPhone = "123", hasTrialAdmin = true),
            HospitalDto(id = 2L, name = "Hospital B", address = "Address B", contactPhone = "456", hasTrialAdmin = false)
        )

        `when`(hospitalService.getAllHospitals()).thenReturn(hospitals)

        val result = hospitalController.getAllHospitals()

        assertEquals(2, result.size)
        assertEquals(1L, result[0].id)
        assertEquals("Hospital A", result[0].name)
        assertEquals(true, result[0].hasTrialAdmin)
        assertEquals(2L, result[1].id)
        assertEquals(false, result[1].hasTrialAdmin)
    }
}
