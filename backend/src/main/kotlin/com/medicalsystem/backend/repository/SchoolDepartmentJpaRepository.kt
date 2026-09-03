package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.SchoolDepartmentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface SchoolDepartmentJpaRepository : JpaRepository<SchoolDepartmentEntity, Long> {
    fun findBySchoolIdOrderByIdAsc(schoolId: Long): List<SchoolDepartmentEntity>
    fun findAllByOrderByIdAsc(): List<SchoolDepartmentEntity>
}
