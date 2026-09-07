package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.entity.DegreeLevelEntity
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.repository.DegreeLevelJpaRepository
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional
class DemographicsReferenceService(
    private val ethnicityJpaRepository: EthnicityJpaRepository,
    private val degreeLevelJpaRepository: DegreeLevelJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val dependencyAnalyzer: ReferenceDependencyAnalyzer
) {

    // === Ethnicities ===

    @Transactional(readOnly = true)
    fun listEthnicities(query: String?, includeDeprecated: Boolean): List<EthnicityDto> {
        val list = if (includeDeprecated) {
            ethnicityJpaRepository.findAllByOrderByNameAsc()
        } else {
            ethnicityJpaRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            list.filter { it.name.contains(query.trim(), ignoreCase = true) }
        } else {
            list
        }

        return filtered.map { e ->
            EthnicityDto(
                id = e.id,
                name = e.name,
                status = e.status,
                studentCount = studentJpaRepository.countByDemographicsEthnicityId(e.id)
            )
        }
    }

    fun createEthnicity(req: SaveSimpleReferenceRequest): EthnicityDto {
        val trimmedName = req.name.trim()
        if (ethnicityJpaRepository.findByName(trimmedName).isPresent) {
            throw ConflictException("Ethnicity with name '$trimmedName' already exists")
        }
        val entity = EthnicityEntity(name = trimmedName, status = ReferenceDataStatus.ACTIVE)
        val saved = ethnicityJpaRepository.save(entity)
        return EthnicityDto(id = saved.id, name = saved.name, status = saved.status)
    }

    fun updateEthnicity(id: Long, req: SaveSimpleReferenceRequest): EthnicityDto {
        val entity = ethnicityJpaRepository.findById(id).orElseThrow { NotFoundException("Ethnicity not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = ethnicityJpaRepository.findByName(trimmedName)
        if (existing.isPresent && existing.get().id != id) {
            throw ConflictException("Another ethnicity with name '$trimmedName' already exists")
        }
        entity.name = trimmedName
        val saved = ethnicityJpaRepository.save(entity)
        return EthnicityDto(
            id = saved.id,
            name = saved.name,
            status = saved.status,
            studentCount = studentJpaRepository.countByDemographicsEthnicityId(id)
        )
    }

    fun setEthnicityStatus(id: Long, newStatus: ReferenceDataStatus): EthnicityDto {
        val entity = ethnicityJpaRepository.findById(id).orElseThrow { NotFoundException("Ethnicity not found with id: $id") }
        entity.status = newStatus
        val saved = ethnicityJpaRepository.save(entity)
        return EthnicityDto(
            id = saved.id,
            name = saved.name,
            status = saved.status,
            studentCount = studentJpaRepository.countByDemographicsEthnicityId(id)
        )
    }

    fun deleteEthnicity(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.ETHNICITY, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete ethnicity '$id' because it is referenced in the system")
        }
        val entity = ethnicityJpaRepository.findById(id).orElseThrow { NotFoundException("Ethnicity not found with id: $id") }
        ethnicityJpaRepository.delete(entity)
    }

    // === Degree Levels ===

    @Transactional(readOnly = true)
    fun listDegreeLevels(query: String?, includeDeprecated: Boolean): List<DegreeLevelDto> {
        val list = if (includeDeprecated) {
            degreeLevelJpaRepository.findAllByOrderByNameAsc()
        } else {
            degreeLevelJpaRepository.findByStatusOrderByNameAsc(ReferenceDataStatus.ACTIVE)
        }

        val filtered = if (!query.isNullOrBlank()) {
            list.filter { it.name.contains(query.trim(), ignoreCase = true) }
        } else {
            list
        }

        return filtered.map { d ->
            DegreeLevelDto(
                id = d.id,
                name = d.name,
                status = d.status,
                studentCount = studentJpaRepository.countByDegreeLevelId(d.id)
            )
        }
    }

    fun createDegreeLevel(req: SaveSimpleReferenceRequest): DegreeLevelDto {
        val trimmedName = req.name.trim()
        if (degreeLevelJpaRepository.findByName(trimmedName).isPresent) {
            throw ConflictException("Degree level with name '$trimmedName' already exists")
        }
        val entity = DegreeLevelEntity(name = trimmedName, status = ReferenceDataStatus.ACTIVE)
        val saved = degreeLevelJpaRepository.save(entity)
        return DegreeLevelDto(id = saved.id, name = saved.name, status = saved.status)
    }

    fun updateDegreeLevel(id: Long, req: SaveSimpleReferenceRequest): DegreeLevelDto {
        val entity = degreeLevelJpaRepository.findById(id).orElseThrow { NotFoundException("Degree level not found with id: $id") }
        val trimmedName = req.name.trim()
        val existing = degreeLevelJpaRepository.findByName(trimmedName)
        if (existing.isPresent && existing.get().id != id) {
            throw ConflictException("Another degree level with name '$trimmedName' already exists")
        }
        entity.name = trimmedName
        val saved = degreeLevelJpaRepository.save(entity)
        return DegreeLevelDto(
            id = saved.id,
            name = saved.name,
            status = saved.status,
            studentCount = studentJpaRepository.countByDegreeLevelId(id)
        )
    }

    fun setDegreeLevelStatus(id: Long, newStatus: ReferenceDataStatus): DegreeLevelDto {
        val entity = degreeLevelJpaRepository.findById(id).orElseThrow { NotFoundException("Degree level not found with id: $id") }
        entity.status = newStatus
        val saved = degreeLevelJpaRepository.save(entity)
        return DegreeLevelDto(
            id = saved.id,
            name = saved.name,
            status = saved.status,
            studentCount = studentJpaRepository.countByDegreeLevelId(id)
        )
    }

    fun deleteDegreeLevel(id: Long) {
        val check = dependencyAnalyzer.checkDependencies(ReferenceCategory.DEGREE_LEVEL, id)
        if (!check.canHardDelete) {
            throw ConflictException("Cannot delete degree level '$id' because it is referenced in the system")
        }
        val entity = degreeLevelJpaRepository.findById(id).orElseThrow { NotFoundException("Degree level not found with id: $id") }
        degreeLevelJpaRepository.delete(entity)
    }
}
