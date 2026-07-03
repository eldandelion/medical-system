package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.SchoolEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface SchoolJpaRepository : JpaRepository<SchoolEntity, Long> {
    fun findByName(name: String): Optional<SchoolEntity>
}
