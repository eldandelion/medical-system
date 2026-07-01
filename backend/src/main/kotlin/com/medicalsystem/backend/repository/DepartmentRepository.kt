package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.DepartmentEntity
import org.springframework.data.jpa.repository.JpaRepository

interface DepartmentRepository : JpaRepository<DepartmentEntity, Long>
