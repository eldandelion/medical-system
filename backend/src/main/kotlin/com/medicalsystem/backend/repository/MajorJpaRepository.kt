package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface MajorJpaRepository : JpaRepository<MajorEntity, Long> {
    fun findByName(name: String): MajorEntity?
    fun findByStatus(status: ReferenceDataStatus): List<MajorEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<MajorEntity>
    fun findByCollegeId(collegeId: Long): List<MajorEntity>
    fun findByCollegeIdAndStatus(collegeId: Long, status: ReferenceDataStatus): List<MajorEntity>
    fun countByCollegeId(collegeId: Long): Long
    fun findAllByOrderByNameAsc(): List<MajorEntity>
}
