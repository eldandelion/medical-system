package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.HospitalDto
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.repository.TrialAdminJpaRepository
import org.springframework.stereotype.Service

@Service
class HospitalService(
    private val hospitalRepository: HospitalRepository,
    private val trialAdminRepository: TrialAdminJpaRepository
) {
    fun getAllHospitals(): List<HospitalDto> {
        val hospitals = hospitalRepository.findAll()
        val allTrialAdmins = trialAdminRepository.findAll()
        val hospitalIdsWithAdmin = allTrialAdmins
            .mapNotNull { it.hospital?.id }
            .toSet()

        return hospitals.map { hospital ->
            HospitalDto(
                id = hospital.id,
                name = hospital.name,
                address = hospital.address,
                contactPhone = hospital.contactPhone,
                hasTrialAdmin = hospitalIdsWithAdmin.contains(hospital.id)
            )
        }
    }
}
