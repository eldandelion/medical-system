package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Student
import java.util.Optional

interface StudentRepository {
    fun findAll(): List<Student>
    fun findById(id: Long): Optional<Student>
    fun existsByStudentNumber(studentNumber: String): Boolean
    fun findByStudentNumber(studentNumber: String): Student?
    fun findByMajorCollegeId(collegeId: Long): List<Student>
    fun save(student: Student): Student
}
