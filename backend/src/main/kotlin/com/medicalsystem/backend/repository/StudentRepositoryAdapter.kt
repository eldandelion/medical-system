package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.StudentMapper
import com.medicalsystem.backend.model.Student
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class StudentRepositoryAdapter(
    private val jpaRepository: StudentJpaRepository,
    private val mapper: StudentMapper
) : StudentRepository {

    override fun findAll(): List<Student> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<Student> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun existsByStudentNumber(studentNumber: String): Boolean {
        return jpaRepository.existsByStudentNumber(studentNumber)
    }

    override fun findByStudentNumber(studentNumber: String): Student? {
        return jpaRepository.findByStudentNumber(studentNumber)?.let { mapper.toModel(it) }
    }

    override fun findByMajorCollegeId(collegeId: Long): List<Student> {
        return jpaRepository.findByMajorCollegeId(collegeId).map { mapper.toModel(it) }
    }

    override fun save(student: Student): Student {
        val entity = mapper.toEntity(student)
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }
}
