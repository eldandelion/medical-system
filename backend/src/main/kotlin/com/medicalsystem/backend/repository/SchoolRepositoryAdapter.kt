package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.SchoolMapper
import com.medicalsystem.backend.model.School
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class SchoolRepositoryAdapter(
    private val jpaRepository: SchoolJpaRepository,
    private val mapper: SchoolMapper
) : SchoolRepository {

    override fun findAll(): List<School> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<School> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByName(name: String): Optional<School> {
        return jpaRepository.findByName(name).map { mapper.toModel(it) }
    }
}
