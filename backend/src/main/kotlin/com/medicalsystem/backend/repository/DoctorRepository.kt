package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.DoctorEntity
import org.springframework.data.jpa.repository.JpaRepository

interface DoctorRepository : JpaRepository<DoctorEntity, Long> {
    fun countByDepartmentHospitalId(hospitalId: Long): Long
    fun countByDepartmentId(departmentId: Long): Long
    fun findByEmployeeNumber(employeeNumber: String): DoctorEntity?
}

