package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.model.ReferenceSubjectType
import jakarta.validation.constraints.NotBlank

// Standard Item Summaries
data class CollegeDto(
    val id: Long,
    val name: String,
    val status: ReferenceDataStatus,
    val majorCount: Long = 0,
    val teacherCount: Long = 0
)

data class MajorDto(
    val id: Long,
    val name: String,
    val collegeId: Long,
    val collegeName: String,
    val status: ReferenceDataStatus,
    val studentCount: Long = 0
)

data class SchoolDepartmentDto(
    val id: Long,
    val name: String,
    val schoolId: Long,
    val schoolName: String = "",
    val status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE,
    val staffCount: Long = 0
)

data class AdminHospitalDto(
    val id: Long,
    val name: String,
    val address: String? = null,
    val contactPhone: String? = null,
    val status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE,
    val departmentCount: Long = 0,
    val activeReferralCount: Long = 0
)

data class HospitalDepartmentDto(
    val id: Long,
    val name: String,
    val hospitalId: Long,
    val hospitalName: String = "",
    val status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE,
    val doctorCount: Long = 0
)

data class EthnicityDto(
    val id: Long,
    val name: String,
    val status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE,
    val studentCount: Long = 0
)

data class DegreeLevelDto(
    val id: Long,
    val name: String,
    val status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE,
    val studentCount: Long = 0
)

data class SchoolDto(
    val id: Long,
    val name: String,
    val status: ReferenceDataStatus = ReferenceDataStatus.ACTIVE,
    val departmentCount: Long = 0,
    val studentCount: Long = 0
)

data class HospitalSummaryDto(
    val id: Long,
    val name: String,
    val address: String? = null,
    val contactPhone: String? = null
)

// Create & Update Requests
data class SaveCollegeRequest(
    @field:NotBlank val name: String
)

data class SaveMajorRequest(
    @field:NotBlank val name: String,
    val collegeId: Long
)

data class SaveSchoolDepartmentRequest(
    @field:NotBlank val name: String,
    val schoolId: Long? = null
)

data class SaveHospitalRequest(
    @field:NotBlank val name: String,
    val address: String? = null,
    val contactPhone: String? = null
)

data class SaveHospitalDepartmentRequest(
    @field:NotBlank val name: String,
    val hospitalId: Long
)

data class SaveSimpleReferenceRequest(
    @field:NotBlank val name: String
)

// Referential Integrity DTOs (Strictly Language-Agnostic)
data class ReferenceDependencyCheckDto(
    val targetId: Long,
    val category: ReferenceCategory,
    val canHardDelete: Boolean,
    val totalReferences: Long,
    val dependencies: List<ReferenceDependencyItemDto>
)

data class ReferenceDependencyItemDto(
    val subjectType: ReferenceSubjectType,
    val count: Long
)

// Bulk CSV Import DTOs
data class ReferenceImportRowDto(
    val rowNumber: Int,
    val status: String, // "READY", "DUPLICATE", "INVALID"
    val name: String,
    val parentName: String? = null,
    val address: String? = null,
    val contactPhone: String? = null,
    val errorCode: String? = null
)

data class ReferenceImportPreviewDto(
    val category: ReferenceCategory,
    val totalRows: Int,
    val readyCount: Int,
    val duplicateCount: Int,
    val invalidCount: Int,
    val rows: List<ReferenceImportRowDto>
)

data class ReferenceImportCommitRequestDto(
    val category: ReferenceCategory,
    val rows: List<ReferenceImportRowDto>,
    val overwriteDuplicates: Boolean = false
)

data class ReferenceImportResultDto(
    val category: ReferenceCategory,
    val totalProcessed: Int,
    val importedCount: Int,
    val updatedCount: Int,
    val skippedCount: Int,
    val failedRows: List<ReferenceImportRowDto>
)
