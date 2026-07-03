package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.Ethnicity
import java.util.Optional

interface EthnicityRepository {
    fun findAll(): List<Ethnicity>
    fun findById(id: Long): Optional<Ethnicity>
    fun findByName(name: String): Optional<Ethnicity>
}
