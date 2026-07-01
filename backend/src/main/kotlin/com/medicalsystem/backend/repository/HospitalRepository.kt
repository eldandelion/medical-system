package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.HospitalEntity
import org.springframework.data.jpa.repository.JpaRepository

interface HospitalRepository : JpaRepository<HospitalEntity, Long>
