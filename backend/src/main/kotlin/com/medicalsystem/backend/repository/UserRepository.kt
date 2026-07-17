package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.User
import java.util.Optional

interface UserRepository {
    fun findById(id: Long): Optional<User>
    fun findByName(name: String): User?
    fun findAll(): List<User>
    fun findAllById(ids: Set<Long>): List<User>
    fun save(user: User): User
    fun deleteAll()
}
