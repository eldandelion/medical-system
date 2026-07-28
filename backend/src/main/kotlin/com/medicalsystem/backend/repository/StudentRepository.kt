package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.User
import java.util.Optional

interface StudentRepository {
    fun findAll(): List<Student>
    fun findVisibleStudentsFor(user: User): List<Student>
    fun findById(id: Long): Optional<Student>
    fun findByIdAndVisibleTo(id: Long, user: User): Optional<Student>
    fun existsByStudentNumber(studentNumber: String): Boolean
    fun findByStudentNumber(studentNumber: String): Student?
    fun findByMajorCollegeId(collegeId: Long): List<Student>
    fun findAllById(ids: Set<Long>): List<Student>
    fun save(student: Student): Student
}
