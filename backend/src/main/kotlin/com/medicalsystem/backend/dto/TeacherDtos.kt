package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.AccountStatus
import jakarta.validation.constraints.NotEmpty

data class TeacherSummaryDto(
    val id: Long,
    val name: String,
    val employeeNumber: String,
    val collegeId: Long,
    val collegeName: String,
    val status: AccountStatus,
    val phone: String?,
    val email: String,
    val assignedStudentCount: Int
)

data class TeacherDetailDto(
    val id: Long,
    val name: String,
    val employeeNumber: String,
    val collegeId: Long,
    val collegeName: String,
    val status: AccountStatus,
    val phone: String?,
    val email: String,
    val assignedStudentCount: Int,
    val assignedStudents: List<StudentDto>
)

data class AssignTeacherStudentsRequest(
    @field:NotEmpty(message = "studentIds must not be empty")
    val studentIds: List<Long>
)

data class AssignTeacherStudentsResponse(
    val assignedCount: Int,
    val reassignedCount: Int,
    val unchangedCount: Int,
    val assignedStudentIds: List<Long>
)

data class UnassignStudentResponse(
    val success: Boolean = true,
    val unassignedStudentId: Long
)
