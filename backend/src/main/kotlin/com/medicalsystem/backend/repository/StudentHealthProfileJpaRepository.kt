package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.StudentHealthProfileEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface StudentHealthProfileJpaRepository : JpaRepository<StudentHealthProfileEntity, Long> {
    fun findByStudentId(studentId: Long): Optional<StudentHealthProfileEntity>
}
