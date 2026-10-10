package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.AssessmentDispatchMapper
import com.medicalsystem.backend.model.AssessmentDispatch
import org.springframework.stereotype.Repository

@Repository
class AssessmentDispatchRepositoryAdapter(
    private val jpaRepository: AssessmentDispatchJpaRepository,
    private val mapper: AssessmentDispatchMapper
) : AssessmentDispatchRepository {

    override fun save(dispatch: AssessmentDispatch): AssessmentDispatch {
        val entity = mapper.toEntity(dispatch)
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }

    override fun findById(id: Long): AssessmentDispatch? {
        return jpaRepository.findById(id).map { mapper.toModel(it) }.orElse(null)
    }

    override fun findAll(): List<AssessmentDispatch> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }
}
