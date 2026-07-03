package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.MajorMapper
import com.medicalsystem.backend.model.Major
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class MajorRepositoryAdapter(
    private val jpaRepository: MajorJpaRepository,
    private val mapper: MajorMapper
) : MajorRepository {

    override fun findAll(): List<Major> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<Major> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByName(name: String): Major? {
        return jpaRepository.findByName(name)?.let { mapper.toModel(it) }
    }
}
