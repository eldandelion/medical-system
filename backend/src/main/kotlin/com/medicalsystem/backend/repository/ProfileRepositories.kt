package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.*
import org.springframework.data.jpa.repository.JpaRepository

interface TeacherRepository : JpaRepository<TeacherEntity, Long>
interface TrialAdminRepository : JpaRepository<TrialAdminEntity, Long>
