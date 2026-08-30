package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HospitalRepository : JpaRepository<HospitalEntity, Long> {
    fun findByName(name: String): HospitalEntity?
    fun findByStatus(status: ReferenceDataStatus): List<HospitalEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<HospitalEntity>
    fun findAllByOrderByNameAsc(): List<HospitalEntity>
}
