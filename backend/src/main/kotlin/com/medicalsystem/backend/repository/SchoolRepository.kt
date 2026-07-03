package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.School
import java.util.Optional

interface SchoolRepository {
    fun findAll(): List<School>
    fun findById(id: Long): Optional<School>
    fun findByName(name: String): Optional<School>
}
