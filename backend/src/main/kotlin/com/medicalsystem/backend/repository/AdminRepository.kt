package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AdminEntity
import org.springframework.data.jpa.repository.JpaRepository

interface AdminRepository : JpaRepository<AdminEntity, Long>
