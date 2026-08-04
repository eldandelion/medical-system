package com.medicalsystem.backend.repository

import com.medicalsystem.backend.mapper.AssessmentAssignmentMapper
import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class AssessmentAssignmentRepositoryAdapter(
    private val jpaRepository: AssessmentAssignmentJpaRepository,
    private val mapper: AssessmentAssignmentMapper
) : AssessmentAssignmentRepository {

    override fun findById(id: Long): Optional<AssessmentAssignment> {
        return jpaRepository.findById(id).map { mapper.toModel(it) }
    }

    override fun findByStudentId(studentId: Long): List<AssessmentAssignment> {
        return jpaRepository.findByStudentId(studentId).map { mapper.toModel(it) }
    }

    override fun findByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): List<AssessmentAssignment> {
        return jpaRepository.findByStudentIdAndStatus(studentId, status).map { mapper.toModel(it) }
    }

    override fun findByAssignedByUserId(userId: Long): List<AssessmentAssignment> {
        return jpaRepository.findByAssignedByUserId(userId).map { mapper.toModel(it) }
    }

    override fun findPendingByStudentIdAndScaleType(
        studentId: Long,
        scaleType: AssessmentScaleType
    ): Optional<AssessmentAssignment> {
        return jpaRepository.findByStudentIdAndScaleTypeAndStatus(studentId, scaleType, AssessmentStatus.PENDING)
            .map { mapper.toModel(it) }
    }

    override fun save(assignment: AssessmentAssignment): AssessmentAssignment {
        val entity = mapper.toEntity(assignment)
        val savedEntity = jpaRepository.save(entity)
        return mapper.toModel(savedEntity)
    }

    override fun saveAll(assignments: List<AssessmentAssignment>): List<AssessmentAssignment> {
        val entities = assignments.map { mapper.toEntity(it) }
        val savedEntities = jpaRepository.saveAll(entities)
        return savedEntities.map { mapper.toModel(it) }
    }

    override fun findAll(): List<AssessmentAssignment> {
        return jpaRepository.findAll().map { mapper.toModel(it) }
    }
    override fun findPendingByStudentIdInAndScaleType(
        studentIds: List<Long>,
        scaleType: AssessmentScaleType
    ): List<AssessmentAssignment> {
        return jpaRepository.findByStudentIdInAndScaleTypeAndStatus(studentIds, scaleType, AssessmentStatus.PENDING)
            .map { mapper.toModel(it) }
    }
}
