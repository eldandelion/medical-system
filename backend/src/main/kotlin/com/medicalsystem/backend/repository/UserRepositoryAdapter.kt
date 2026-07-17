package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.UserMapper
import com.medicalsystem.backend.model.User
import org.springframework.stereotype.Repository
import java.util.Optional

import jakarta.persistence.EntityManager
import com.medicalsystem.backend.entity.DoctorEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import com.medicalsystem.backend.entity.DepartmentEntity
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.model.Doctor
import com.medicalsystem.backend.model.Teacher
import com.medicalsystem.backend.model.TrialAdmin

@Repository
class UserRepositoryAdapter(
    private val jpaRepository: UserJpaRepository,
    private val mapper: UserMapper,
    private val entityManager: EntityManager
) : UserRepository {

    override fun findById(id: Long): Optional<User> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByName(name: String): User? {
        val entity = jpaRepository.findByName(name) ?: return null
        return mapper.toModel(entity)
    }

    override fun findAll(): List<User> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }

    override fun findAllById(ids: Set<Long>): List<User> {
        return jpaRepository.findAllById(ids).map { mapper.toModel(it) }
    }

    override fun save(user: User): User {
        val entity = mapper.toEntity(user)
        
        when (user) {
            is Doctor -> (entity as DoctorEntity).department = entityManager.getReference(DepartmentEntity::class.java, user.departmentId)
            is Teacher -> user.collegeId?.let { (entity as TeacherEntity).college = entityManager.getReference(CollegeEntity::class.java, it) }
            is TrialAdmin -> user.hospitalId?.let { (entity as TrialAdminEntity).hospital = entityManager.getReference(HospitalEntity::class.java, it) }
            else -> {} // Other user types do not have relationships to map here
        }
        
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }

    override fun deleteAll() {
        jpaRepository.deleteAll()
    }
}
