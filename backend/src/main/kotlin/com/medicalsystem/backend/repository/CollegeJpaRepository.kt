package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CollegeJpaRepository : JpaRepository<CollegeEntity, Long> {
    fun findByName(name: String): CollegeEntity?
    fun findByStatus(status: ReferenceDataStatus): List<CollegeEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<CollegeEntity>
    fun findAllByOrderByNameAsc(): List<CollegeEntity>
}
