package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.DegreeLevelEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface DegreeLevelJpaRepository : JpaRepository<DegreeLevelEntity, Long> {
    fun findByName(name: String): Optional<DegreeLevelEntity>
}
