package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.EthnicityDto
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class DictionaryService(
    private val ethnicityJpaRepository: EthnicityJpaRepository
) {
    @Transactional(readOnly = true)
    fun getAllEthnicities(): List<EthnicityDto> {
        return ethnicityJpaRepository.findAll()
            .sortedBy { it.id }
            .map { EthnicityDto(id = it.id, name = it.name) }
    }
}
