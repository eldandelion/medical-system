package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.StudentEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.stereotype.Repository

@Repository
interface StudentJpaRepository : JpaRepository<StudentEntity, Long>, JpaSpecificationExecutor<StudentEntity> {
    fun existsByStudentNumber(studentNumber: String): Boolean
    fun findByStudentNumber(studentNumber: String): StudentEntity?
    fun findByMajorCollegeId(collegeId: Long): List<StudentEntity>

    @Query("SELECT s.studentNumber FROM StudentEntity s")
    fun findAllStudentNumbers(): Set<String>
}
