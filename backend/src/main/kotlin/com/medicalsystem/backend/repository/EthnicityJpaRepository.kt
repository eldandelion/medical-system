package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.EthnicityEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface EthnicityJpaRepository : JpaRepository<EthnicityEntity, Long> {
    fun findByName(name: String): Optional<EthnicityEntity>
}
