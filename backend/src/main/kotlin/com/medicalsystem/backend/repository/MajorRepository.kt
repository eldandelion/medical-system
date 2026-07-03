package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Major
import java.util.Optional

interface MajorRepository {
    fun findAll(): List<Major>
    fun findById(id: Long): Optional<Major>
    fun findByName(name: String): Major?
}
