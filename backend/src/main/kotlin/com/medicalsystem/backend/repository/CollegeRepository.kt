package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.College
import java.util.Optional

interface CollegeRepository {
    fun findAll(): List<College>
    fun findById(id: Long): Optional<College>
    fun findByName(name: String): College?
}
