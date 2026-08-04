package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.AssessmentScaleType
import com.medicalsystem.backend.model.AssessmentStatus
import java.util.Optional

interface AssessmentAssignmentRepository {
    fun findById(id: Long): Optional<AssessmentAssignment>
    fun findByStudentId(studentId: Long): List<AssessmentAssignment>
    fun findByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): List<AssessmentAssignment>
    fun findByAssignedByUserId(userId: Long): List<AssessmentAssignment>
    fun findPendingByStudentIdAndScaleType(studentId: Long, scaleType: AssessmentScaleType): Optional<AssessmentAssignment>
    fun save(assignment: AssessmentAssignment): AssessmentAssignment
    fun saveAll(assignments: List<AssessmentAssignment>): List<AssessmentAssignment>
    fun findAll(): List<AssessmentAssignment>
}
