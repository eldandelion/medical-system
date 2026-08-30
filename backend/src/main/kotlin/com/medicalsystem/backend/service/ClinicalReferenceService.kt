package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.entity.HospitalDepartmentEntity
import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.HospitalStatusChangedEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.repository.DoctorRepository
import com.medicalsystem.backend.repository.HospitalDepartmentRepository
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.repository.ReferralJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class ClinicalReferenceService(
    private val hospitalRepository: HospitalRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository,
    private val doctorRepository: DoctorRepository,
    private val referralJpaRepository: ReferralJpaRepository,
    private val dependencyAnalyzer: ReferenceDependencyAnalyzer,
    private val eventPublisher: DomainEventPublisher
) {

    // === Hospitals ===

    @Transactional(readOnly = true)
    fun listHospitals(query: String?, includeDeprecated: Boolean): List<AdminHospitalDto> {
        val hospitals = if (includeDeprecated) {
            hospitalRepository.findAllByOrderByNameAsc()
        } else {
            hospitalRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            hospitals.filter { it.name.contains(query.trim(), ignoreCase = true) || (it.address?.contains(query.trim(), ignoreCase = true) == true) }
        } else {
            hospitals
        }

        return filtered.map { h ->
            AdminHospitalDto(
                id = h.id,
                name = h.name,
                address = h.address,
                contactPhone = h.contactPhone,
                status = h.status,
                departmentCount = hospitalDepartmentRepository.countByHospitalId(h.id),
                activeReferralCount = referralJpaRepository.countByDestinationHospitalId(h.id)
            )
        }
    }

    fun createHospital(req: SaveHospitalRequest): AdminHospitalDto {
        val trimmedName = req.name.trim()
        if (hospitalRepository.findByName(trimmedName) != null) {
            throw ConflictException("Hospital with name '$trimmedName' already exists")
        }
        val entity = HospitalEntity(
            name = trimmedName,
            address = req.address?.trim()?.ifBlank { null },
            contactPhone = req.contactPhone?.trim()?.ifBlank { null },
            status = ReferenceDataStatus.ACTIVE
        )
        val saved = hospitalRepository.save(entity)
        return AdminHospitalDto(
            id = saved.id,
            name = saved.name,
            address = saved.address,
            contactPhone = saved.contactPhone,
            status = saved.status
        )
    }

    fun updateHospital(id: Long, req: SaveHospitalRequest): AdminHospitalDto {
        val entity = hospitalRepository.findById(id).orElseThrow { NotFoundException("Hospital not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = hospitalRepository.findByName(trimmedName)
        if (existing != null && existing.id != id) {
            throw ConflictException("Another hospital with name '$trimmedName' already exists")
        }
        entity.name = trimmedName
        entity.address = req.address?.trim()?.ifBlank { null }
        entity.contactPhone = req.contactPhone?.trim()?.ifBlank { null }
        val saved = hospitalRepository.save(entity)
        return AdminHospitalDto(
            id = saved.id,
            name = saved.name,
            address = saved.address,
            contactPhone = saved.contactPhone,
            status = saved.status,
            departmentCount = hospitalDepartmentRepository.countByHospitalId(id),
            activeReferralCount = referralJpaRepository.countByDestinationHospitalId(id)
        )
    }

    fun setHospitalStatus(id: Long, newStatus: ReferenceDataStatus): AdminHospitalDto {
        val entity = hospitalRepository.findById(id).orElseThrow { NotFoundException("Hospital not found with id: $id") }
        entity.status = newStatus
        val saved = hospitalRepository.save(entity)
        eventPublisher.publish(HospitalStatusChangedEvent(id, newStatus))
        return AdminHospitalDto(
            id = saved.id,
            name = saved.name,
            address = saved.address,
            contactPhone = saved.contactPhone,
            status = saved.status,
            departmentCount = hospitalDepartmentRepository.countByHospitalId(id),
            activeReferralCount = referralJpaRepository.countByDestinationHospitalId(id)
        )
    }

    fun deleteHospital(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.HOSPITAL, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete hospital '$id' because it is referenced in the system")
        }
        val entity = hospitalRepository.findById(id).orElseThrow { NotFoundException("Hospital not found with id: $id") }
        hospitalRepository.delete(entity)
    }

    // === Hospital Departments ===

    @Transactional(readOnly = true)
    fun listHospitalDepartments(query: String?, hospitalId: Long?, includeDeprecated: Boolean): List<HospitalDepartmentDto> {
        val depts = if (hospitalId != null) {
            if (includeDeprecated) hospitalDepartmentRepository.findByHospitalId(hospitalId)
            else hospitalDepartmentRepository.findByHospitalIdAndStatus(hospitalId, ReferenceDataStatus.ACTIVE)
        } else {
            if (includeDeprecated) hospitalDepartmentRepository.findAllByOrderByNameAsc()
            else hospitalDepartmentRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            depts.filter { it.name.contains(query.trim(), ignoreCase = true) || it.hospital.name.contains(query.trim(), ignoreCase = true) }
        } else {
            depts
        }

        return filtered.map { dept ->
            HospitalDepartmentDto(
                id = dept.id,
                name = dept.name,
                hospitalId = dept.hospital.id,
                hospitalName = dept.hospital.name,
                status = dept.status,
                doctorCount = doctorRepository.countByDepartmentId(dept.id)
            )
        }
    }

    fun createHospitalDepartment(req: SaveHospitalDepartmentRequest): HospitalDepartmentDto {
        val trimmedName = req.name.trim()
        val hospital = hospitalRepository.findById(req.hospitalId).orElseThrow { NotFoundException("Hospital not found with id: ${req.hospitalId}") }
        if (hospital.status == ReferenceDataStatus.DEPRECATED) {
            throw ConflictException("Cannot add department under a deprecated hospital")
        }
        val existingInHospital = hospitalDepartmentRepository.findByHospitalId(req.hospitalId).any { it.name.equals(trimmedName, ignoreCase = true) }
        if (existingInHospital) {
            throw ConflictException("Department '$trimmedName' already exists in hospital '${hospital.name}'")
        }
        val entity = HospitalDepartmentEntity(name = trimmedName, hospital = hospital, status = ReferenceDataStatus.ACTIVE)
        val saved = hospitalDepartmentRepository.save(entity)
        return HospitalDepartmentDto(
            id = saved.id,
            name = saved.name,
            hospitalId = hospital.id,
            hospitalName = hospital.name,
            status = saved.status
        )
    }

    fun updateHospitalDepartment(id: Long, req: SaveHospitalDepartmentRequest): HospitalDepartmentDto {
        val entity = hospitalDepartmentRepository.findById(id).orElseThrow { NotFoundException("Hospital department not found with id: $id") }
        val trimmedName = req.name.trim()
        val hospital = hospitalRepository.findById(req.hospitalId).orElseThrow { NotFoundException("Hospital not found with id: ${req.hospitalId}") }
        val existingInHospital = hospitalDepartmentRepository.findByHospitalId(req.hospitalId)
            .any { it.id != id && it.name.equals(trimmedName, ignoreCase = true) }
        if (existingInHospital) {
            throw ConflictException("Another department '$trimmedName' already exists in hospital '${hospital.name}'")
        }
        entity.name = trimmedName
        entity.hospital = hospital
        val saved = hospitalDepartmentRepository.save(entity)
        return HospitalDepartmentDto(
            id = saved.id,
            name = saved.name,
            hospitalId = hospital.id,
            hospitalName = hospital.name,
            status = saved.status,
            doctorCount = doctorRepository.countByDepartmentId(id)
        )
    }

    fun setHospitalDepartmentStatus(id: Long, newStatus: ReferenceDataStatus): HospitalDepartmentDto {
        val entity = hospitalDepartmentRepository.findById(id).orElseThrow { NotFoundException("Hospital department not found with id: $id") }
        entity.status = newStatus
        val saved = hospitalDepartmentRepository.save(entity)
        return HospitalDepartmentDto(
            id = saved.id,
            name = saved.name,
            hospitalId = saved.hospital.id,
            hospitalName = saved.hospital.name,
            status = saved.status,
            doctorCount = doctorRepository.countByDepartmentId(id)
        )
    }

    fun deleteHospitalDepartment(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.HOSPITAL_DEPARTMENT, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete hospital department '$id' because it is referenced in the system")
        }
        val entity = hospitalDepartmentRepository.findById(id).orElseThrow { NotFoundException("Hospital department not found with id: $id") }
        hospitalDepartmentRepository.delete(entity)
    }
}
