package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.SchoolEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface SchoolRepository : JpaRepository<SchoolEntity, Long> {
    fun findByName(name: String): Optional<SchoolEntity>
}
