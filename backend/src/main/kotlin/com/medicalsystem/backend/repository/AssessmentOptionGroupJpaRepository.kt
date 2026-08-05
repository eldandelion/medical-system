package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentOptionGroupEntity
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AssessmentOptionGroupJpaRepository : JpaRepository<AssessmentOptionGroupEntity, Long> {
    @EntityGraph(attributePaths = ["options"])
    fun findByName(name: String): AssessmentOptionGroupEntity?
}
