package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.HeadCounsellorEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface UserJpaRepository : JpaRepository<UserEntity, Long> {
    fun findByName(name: String): UserEntity?
    fun findByEmail(email: com.medicalsystem.backend.model.EmailAddress): UserEntity?
    fun existsByEmail(email: com.medicalsystem.backend.model.EmailAddress): Boolean
}

@Repository
interface TeacherJpaRepository : JpaRepository<TeacherEntity, Long> {
    fun findByEmployeeNumber(employeeNumber: String): TeacherEntity?
}

@Repository
interface HeadCounsellorJpaRepository : JpaRepository<HeadCounsellorEntity, Long> {
    fun findByEmployeeNumber(employeeNumber: String): HeadCounsellorEntity?
}

@Repository
interface TrialAdminJpaRepository : JpaRepository<TrialAdminEntity, Long> {
    fun findByEmployeeNumber(employeeNumber: String): TrialAdminEntity?
}
