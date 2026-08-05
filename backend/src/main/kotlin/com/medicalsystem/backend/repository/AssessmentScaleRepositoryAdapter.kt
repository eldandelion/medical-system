package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.AssessmentScaleMapper
import com.medicalsystem.backend.model.AssessmentScale
import com.medicalsystem.backend.model.AssessmentScaleRepository
import com.medicalsystem.backend.model.AssessmentScaleType
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class AssessmentScaleRepositoryAdapter(
    private val jpaRepository: AssessmentScaleJpaRepository,
    private val mapper: AssessmentScaleMapper
) : AssessmentScaleRepository {

    override fun findByScaleType(scaleType: AssessmentScaleType): Optional<AssessmentScale> {
        val entity = jpaRepository.findByScaleType(scaleType)
        return Optional.ofNullable(entity?.let { mapper.toModel(it) })
    }

    override fun findAll(): List<AssessmentScale> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun save(scale: AssessmentScale): AssessmentScale {
        val entity = mapper.toEntity(scale)
        val saved = jpaRepository.save(entity)
        return mapper.toModel(saved)
    }

    override fun count(): Long {
        return jpaRepository.count()
    }

    override fun deleteAll() {
        jpaRepository.deleteAll()
    }
}
