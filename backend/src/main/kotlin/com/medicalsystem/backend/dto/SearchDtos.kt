package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
import com.medicalsystem.backend.model.RiskStatus
import java.time.LocalDate
import java.time.LocalDateTime

data class StudentSearchResultDto(
    val id: Long,
    val studentNumber: String,
    val name: String,
    val majorName: String?,
    val collegeName: String?,
    val enrollmentDate: LocalDate?,
    val riskLevel: RiskStatus?
)

data class ReferralSearchResultDto(
    val id: String,
    val studentId: Long,
    val studentName: String?,
    val studentNumber: String?,
    val title: String,
    val descriptionSnippet: String,
    val status: ReferralStatus,
    val type: ReferralType,
    val createdAt: LocalDateTime,
    val destinationHospitalName: String?,
    val destinationDoctorName: String?,
    val riskLevel: RiskStatus?
)

data class AssessmentSearchResultDto(
    val id: String,
    val resultType: String, // "ASSIGNMENT" or "CATALOG"
    val batteryCode: String,
    val title: String,
    val subtitle: String?,
    val status: String?, // "PENDING", "COMPLETED", or null for catalog scales
    val assignedByName: String?,
    val dueDate: LocalDate?,
    val duration: String?
)

data class SearchResultDto(
    val query: String,
    val students: List<StudentSearchResultDto> = emptyList(),
    val referrals: List<ReferralSearchResultDto> = emptyList(),
    val assessments: List<AssessmentSearchResultDto> = emptyList()
)
