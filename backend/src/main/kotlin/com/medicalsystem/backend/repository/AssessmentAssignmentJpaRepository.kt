package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentAssignmentEntity
import com.medicalsystem.backend.model.AssessmentStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
interface AssessmentAssignmentJpaRepository : JpaRepository<AssessmentAssignmentEntity, Long>, JpaSpecificationExecutor<AssessmentAssignmentEntity> {
    fun findByStudentIdOrderByAssignedAtDesc(studentId: Long, pageable: Pageable): Page<AssessmentAssignmentEntity>
    fun findByStudentId(studentId: Long): List<AssessmentAssignmentEntity>
    fun findByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): List<AssessmentAssignmentEntity>
    fun findByAssignedByUserId(userId: Long): List<AssessmentAssignmentEntity>

    fun findByStudentIdAndBatteryCodeAndStatus(
        studentId: Long,
        batteryCode: String,
        status: AssessmentStatus
    ): Optional<AssessmentAssignmentEntity>

    fun findByStudentIdInAndBatteryCodeAndStatus(
        studentIds: List<Long>,
        batteryCode: String,
        status: AssessmentStatus
    ): List<AssessmentAssignmentEntity>
}
