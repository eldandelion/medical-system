package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.SchoolDepartment
import java.util.Optional

interface SchoolDepartmentRepository {
    fun findById(id: Long): Optional<SchoolDepartment>
}
