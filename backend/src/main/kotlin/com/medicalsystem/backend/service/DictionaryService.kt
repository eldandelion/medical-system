package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DictionaryService(
    private val ethnicityJpaRepository: EthnicityJpaRepository,
    private val schoolJpaRepository: SchoolJpaRepository,
    private val schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository,
    private val hospitalRepository: HospitalRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository
) {
    @Transactional(readOnly = true)
    fun getAllEthnicities(): List<EthnicityDto> {
        return ethnicityJpaRepository.findAll()
            .sortedBy { it.id }
            .map { EthnicityDto(id = it.id, name = it.name) }
    }

    @Transactional(readOnly = true)
    fun getAllSchools(): List<SchoolDto> {
        return schoolJpaRepository.findAll()
            .sortedBy { it.id }
            .map { SchoolDto(id = it.id, name = it.name) }
    }

    @Transactional(readOnly = true)
    fun getSchoolDepartments(schoolId: Long?): List<SchoolDepartmentDto> {
        val list = if (schoolId != null) {
            schoolDepartmentJpaRepository.findBySchoolIdOrderByIdAsc(schoolId)
        } else {
            schoolDepartmentJpaRepository.findAllByOrderByIdAsc()
        }
        return list.map { SchoolDepartmentDto(id = it.id, name = it.name, schoolId = it.school.id) }
    }

    @Transactional(readOnly = true)
    fun getAllHospitals(): List<HospitalSummaryDto> {
        return hospitalRepository.findAll()
            .sortedBy { it.id }
            .map {
                HospitalSummaryDto(
                    id = it.id,
                    name = it.name,
                    address = it.address,
                    contactPhone = it.contactPhone
                )
            }
    }

    @Transactional(readOnly = true)
    fun getHospitalDepartments(hospitalId: Long?): List<HospitalDepartmentDto> {
        val list = if (hospitalId != null) {
            hospitalDepartmentRepository.findByHospitalIdOrderByIdAsc(hospitalId)
        } else {
            hospitalDepartmentRepository.findAllByOrderByIdAsc()
        }
        return list.map { HospitalDepartmentDto(id = it.id, name = it.name, hospitalId = it.hospital.id) }
    }
}
