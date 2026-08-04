package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentAssignmentEntity
import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import java.util.Optional

interface AssessmentAssignmentJpaRepository : JpaRepository<AssessmentAssignmentEntity, Long> {
    fun findByStudentId(studentId: Long): List<AssessmentAssignmentEntity>
    fun findByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): List<AssessmentAssignmentEntity>
    fun findByAssignedByUserId(assignedByUserId: Long): List<AssessmentAssignmentEntity>

    @Query("SELECT a FROM AssessmentAssignmentEntity a WHERE a.student.id = :studentId AND a.scaleType = :scaleType AND a.status = :status")
    fun findByStudentIdAndScaleTypeAndStatus(
        @Param("studentId") studentId: Long,
        @Param("scaleType") scaleType: AssessmentScaleType,
        @Param("status") status: AssessmentStatus
    ): Optional<AssessmentAssignmentEntity>
}
