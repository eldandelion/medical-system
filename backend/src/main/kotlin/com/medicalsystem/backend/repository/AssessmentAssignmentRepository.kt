package com.medicalsystem.backend.repository

import com.medicalsystem.backend.model.AssessmentAssignment
import com.medicalsystem.backend.model.AssessmentStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import java.util.Optional

interface AssessmentAssignmentRepository {
    fun findByStudentIdOrderByAssignedAtDesc(studentId: Long, pageable: Pageable): Page<AssessmentAssignment>
    fun findById(id: Long): Optional<AssessmentAssignment>
    fun findByStudentId(studentId: Long): List<AssessmentAssignment>
    fun findByStudentIdAndStatus(studentId: Long, status: AssessmentStatus): List<AssessmentAssignment>
    fun findByAssignedByUserId(userId: Long): List<AssessmentAssignment>
    fun findPendingByStudentIdAndBatteryCode(studentId: Long, batteryCode: String): Optional<AssessmentAssignment>
    fun save(assignment: AssessmentAssignment): AssessmentAssignment
    fun saveAll(assignments: List<AssessmentAssignment>): List<AssessmentAssignment>
    fun findAll(): List<AssessmentAssignment>
    fun findPendingByStudentIdInAndBatteryCode(studentIds: List<Long>, batteryCode: String): List<AssessmentAssignment>
}
