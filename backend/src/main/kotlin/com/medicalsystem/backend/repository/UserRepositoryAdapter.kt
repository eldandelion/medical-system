package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.UserMapper
import com.medicalsystem.backend.model.User
import org.springframework.stereotype.Repository
import java.util.Optional
import jakarta.persistence.EntityManager

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
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }

    override fun deleteAll() {
        jpaRepository.deleteAll()
    }
}
