package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.EthnicityMapper
import com.medicalsystem.backend.model.Ethnicity
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class EthnicityRepositoryAdapter(
    private val jpaRepository: EthnicityJpaRepository,
    private val mapper: EthnicityMapper
) : EthnicityRepository {

    override fun findAll(): List<Ethnicity> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<Ethnicity> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByName(name: String): Optional<Ethnicity> {
        return jpaRepository.findByName(name).map { mapper.toModel(it) }
    }
}
