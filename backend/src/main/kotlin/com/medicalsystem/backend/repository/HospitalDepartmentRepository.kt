package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.HospitalDepartmentEntity
import com.medicalsystem.backend.model.ReferenceDataStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface HospitalDepartmentRepository : JpaRepository<HospitalDepartmentEntity, Long> {
    fun findByName(name: String): HospitalDepartmentEntity?
    fun findByStatus(status: ReferenceDataStatus): List<HospitalDepartmentEntity>
    fun findByStatusOrderByNameAsc(status: ReferenceDataStatus): List<HospitalDepartmentEntity>
    fun findByHospitalId(hospitalId: Long): List<HospitalDepartmentEntity>
    fun findByHospitalIdAndStatus(hospitalId: Long, status: ReferenceDataStatus): List<HospitalDepartmentEntity>
    fun countByHospitalId(hospitalId: Long): Long
    fun findAllByOrderByNameAsc(): List<HospitalDepartmentEntity>
    fun findByHospitalIdOrderByIdAsc(hospitalId: Long): List<HospitalDepartmentEntity>
    fun findAllByOrderByIdAsc(): List<HospitalDepartmentEntity>
}
