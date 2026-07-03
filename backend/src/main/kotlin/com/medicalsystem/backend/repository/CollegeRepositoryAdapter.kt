package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.CollegeMapper
import com.medicalsystem.backend.model.College
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class CollegeRepositoryAdapter(
    private val jpaRepository: CollegeJpaRepository,
    private val mapper: CollegeMapper
) : CollegeRepository {

    override fun findAll(): List<College> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<College> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByName(name: String): College? {
        return jpaRepository.findByName(name)?.let { mapper.toModel(it) }
    }
}
