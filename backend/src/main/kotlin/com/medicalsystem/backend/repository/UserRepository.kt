package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.HeadCounsellorEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserRepository : JpaRepository<UserEntity, Long> {
    fun findByName(name: String): UserEntity?
}

@Repository
interface TeacherRepository : JpaRepository<TeacherEntity, Long>

@Repository
interface HeadCounsellorRepository : JpaRepository<HeadCounsellorEntity, Long>

@Repository
interface TrialAdminRepository : JpaRepository<TrialAdminEntity, Long>
