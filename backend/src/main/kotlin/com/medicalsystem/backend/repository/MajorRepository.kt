package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.MajorEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MajorRepository : JpaRepository<MajorEntity, Long> {
    fun findByName(name: String): MajorEntity?
}
