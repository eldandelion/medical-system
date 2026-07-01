package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.EthnicityEntity
import org.springframework.data.jpa.repository.JpaRepository
import java.util.Optional

interface EthnicityRepository : JpaRepository<EthnicityEntity, Long> {
    fun findByName(name: String): Optional<EthnicityEntity>
}
