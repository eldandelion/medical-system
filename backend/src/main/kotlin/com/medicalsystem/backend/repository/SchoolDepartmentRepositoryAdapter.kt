package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.SchoolDepartment
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class SchoolDepartmentRepositoryAdapter(
    private val jpaRepository: SchoolDepartmentJpaRepository
) : SchoolDepartmentRepository {
    override fun findById(id: Long): Optional<SchoolDepartment> {
        return jpaRepository.findById(id).map { entity ->
            SchoolDepartment(
                id = entity.id,
                name = entity.name,
                schoolId = entity.school.id
            )
        }
    }
}
