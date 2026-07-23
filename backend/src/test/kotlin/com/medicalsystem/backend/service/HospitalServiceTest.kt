package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.HospitalDto
import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.repository.TrialAdminJpaRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.`when`
import org.mockito.Mockito.mock

class HospitalServiceTest {

    private lateinit var hospitalRepository: HospitalRepository
    private lateinit var trialAdminRepository: TrialAdminJpaRepository
    private lateinit var hospitalService: HospitalService

    @BeforeEach
    fun setUp() {
        hospitalRepository = mock(HospitalRepository::class.java)
        trialAdminRepository = mock(TrialAdminJpaRepository::class.java)
        hospitalService = HospitalService(hospitalRepository, trialAdminRepository)
    }

    @Test
    fun `should return all hospitals and accurately map hasTrialAdmin flag`() {
        val hosp1 = HospitalEntity(id = 1L, name = "Hospital A", address = "Address A", contactPhone = "123")
        val hosp2 = HospitalEntity(id = 2L, name = "Hospital B", address = "Address B", contactPhone = "456")

        `when`(hospitalRepository.findAll()).thenReturn(listOf(hosp1, hosp2))
        
        val trialAdmin = TrialAdminEntity(name = "Admin", email = com.medicalsystem.backend.model.EmailAddress("admin@test.com"), hospital = hosp1)
        // Simulate a query to find all trial admins to map correctly
        `when`(trialAdminRepository.findAll()).thenReturn(listOf(trialAdmin))

        val results = hospitalService.getAllHospitals()

        assertEquals(2, results.size)
        assertEquals(true, results.find { it.id == 1L }?.hasTrialAdmin)
        assertEquals(false, results.find { it.id == 2L }?.hasTrialAdmin)
    }
}
