package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.SchoolDepartmentEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface SchoolDepartmentJpaRepository : JpaRepository<SchoolDepartmentEntity, Long> {
    fun findByName(name: String): SchoolDepartmentEntity?
    fun findByStatus(status: ReferenceDataStatus): List<SchoolDepartmentEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<SchoolDepartmentEntity>
    fun findBySchoolId(schoolId: Long): List<SchoolDepartmentEntity>
    fun findBySchoolIdAndStatus(schoolId: Long, status: ReferenceDataStatus): List<SchoolDepartmentEntity>
    fun countBySchoolId(schoolId: Long): Long
    fun findAllByOrderByNameAsc(): List<SchoolDepartmentEntity>
    fun findBySchoolIdOrderByIdAsc(schoolId: Long): List<SchoolDepartmentEntity>
    fun findAllByOrderByIdAsc(): List<SchoolDepartmentEntity>
}
