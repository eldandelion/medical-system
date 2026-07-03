package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.StudentHealthProfileMapper
import com.medicalsystem.backend.model.StudentHealthProfile
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class StudentHealthProfileRepositoryAdapter(
    private val jpaRepository: StudentHealthProfileJpaRepository,
    private val mapper: StudentHealthProfileMapper
) : StudentHealthProfileRepository {

    override fun findByStudentId(studentId: Long): Optional<StudentHealthProfile> {
        return jpaRepository.findByStudentId(studentId).map { mapper.toModel(it) }
    }

    override fun save(profile: StudentHealthProfile): StudentHealthProfile {
        val entity = mapper.toEntity(profile)
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }
}
