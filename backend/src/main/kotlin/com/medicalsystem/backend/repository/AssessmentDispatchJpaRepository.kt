package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentDispatchEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.stereotype.Repository

@Repository
interface AssessmentDispatchJpaRepository : JpaRepository<AssessmentDispatchEntity, Long> {
    @EntityGraph(attributePaths = ["dispatchedByUser"])
    override fun findAll(): List<AssessmentDispatchEntity>
}
