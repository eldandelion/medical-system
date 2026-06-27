package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.CollegeEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface CollegeRepository : JpaRepository<CollegeEntity, Long> {
    fun findByName(name: String): CollegeEntity?
}
