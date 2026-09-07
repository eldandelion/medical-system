package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.SchoolEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface SchoolJpaRepository : JpaRepository<SchoolEntity, Long> {
    fun findByName(name: String): Optional<SchoolEntity>
    fun findByStatus(status: ReferenceDataStatus): List<SchoolEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<SchoolEntity>
    fun findAllByOrderByNameAsc(): List<SchoolEntity>
}
