package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.HospitalDepartmentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface HospitalDepartmentRepository : JpaRepository<HospitalDepartmentEntity, Long>
