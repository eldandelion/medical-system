package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.*
import org.springframework.data.jpa.repository.JpaRepository

interface TeacherRepository : JpaRepository<TeacherEntity, Long>
interface TrialAdminRepository : JpaRepository<TrialAdminEntity, Long> {
    fun existsByHospitalId(hospitalId: Long): Boolean
    fun findByHospitalId(hospitalId: Long): List<TrialAdminEntity>
}
