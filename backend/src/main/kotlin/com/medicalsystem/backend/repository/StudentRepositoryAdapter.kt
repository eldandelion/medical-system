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

    override fun findVisibleStudentsFor(user: com.medicalsystem.backend.model.User): List<Student> {
        val criteria = com.medicalsystem.backend.model.StudentVisibilityPolicy.getVisibilityCriteria(user)
        val spec = StudentJpaSpecification.fromVisibilityCriteria(criteria)
        return jpaRepository.findAll(spec).map { mapper.toModel(it) }
    }

    override fun findById(id: Long): Optional<Student> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByIdAndVisibleTo(id: Long, user: com.medicalsystem.backend.model.User): Optional<Student> {
        val criteria = com.medicalsystem.backend.model.StudentVisibilityPolicy.getVisibilityCriteria(user)
        val visibilitySpec = StudentJpaSpecification.fromVisibilityCriteria(criteria)
        val idSpec = org.springframework.data.jpa.domain.Specification<com.medicalsystem.backend.entity.StudentEntity> { root, _, cb ->
            cb.equal(root.get<Long>("id"), id)
        }
        val spec = visibilitySpec.and(idSpec)
        return jpaRepository.findOne(spec).map { mapper.toModel(it) }
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

    override fun findAllById(ids: Set<Long>): List<Student> {
        return jpaRepository.findAllById(ids).map { mapper.toModel(it) }
    }

    override fun save(student: Student): Student {
        val entity = mapper.toEntity(student)
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }
}
