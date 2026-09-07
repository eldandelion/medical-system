package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.DegreeLevelEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface DegreeLevelJpaRepository : JpaRepository<DegreeLevelEntity, Long> {
    fun findByName(name: String): Optional<DegreeLevelEntity>
    fun findByStatus(status: ReferenceDataStatus): List<DegreeLevelEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<DegreeLevelEntity>
    fun findAllByOrderByNameAsc(): List<DegreeLevelEntity>
}
