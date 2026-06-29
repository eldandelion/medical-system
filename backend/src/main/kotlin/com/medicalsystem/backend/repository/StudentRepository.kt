package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.StudentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface StudentRepository : JpaRepository<StudentEntity, Long> {
    fun existsByStudentNumber(studentNumber: String): Boolean
    fun findByStudentNumber(studentNumber: String): StudentEntity?
}
