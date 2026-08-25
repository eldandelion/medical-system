package com.medicalsystem.backend.dto

import java.time.LocalDate

enum class StudentImportStatus {
    READY,
    DUPLICATE,
    INVALID
}

enum class StudentImportErrorCode {
    REQUIRED_FIELD_MISSING,
    MAJOR_NOT_FOUND,
    TEACHER_NOT_FOUND,
    ETHNICITY_NOT_FOUND,
    DUPLICATE_IN_DATABASE,
    INTRA_FILE_DUPLICATE,
    INVALID_ID_CARD_FORMAT,
    INVALID_PHONE_FORMAT,
    INVALID_EMAIL_FORMAT,
    INVALID_DATE_FORMAT,
    FUTURE_DATE,
    INVALID_NAME_FORMAT,
    DEGREE_LEVEL_NOT_FOUND
}

data class StudentImportFieldErrorDto(
    val field: String,
    val code: StudentImportErrorCode,
    val invalidValue: String? = null
)

data class StudentImportRowDto(
    val rowNumber: Int,
    val studentNumber: String,
    val name: String,
    val major: String,
    val enrollmentDate: LocalDate?,
    val degreeLevel: String? = null,
    val idCardNumber: String?,
    val gender: String?,
    val ethnicity: String?,
    val contactNumber: String?,
    val email: String?,
    val homeAddress: String?,
    val emergencyContactName: String?,
    val emergencyContactPhone: String?,
    val teacherEmployeeNumber: String?,
    val status: StudentImportStatus,
    val errors: List<StudentImportFieldErrorDto> = emptyList()
)

data class StudentImportPreviewDto(
    val totalRows: Int,
    val readyCount: Int,
    val duplicateCount: Int,
    val invalidCount: Int,
    val rows: List<StudentImportRowDto>
)

data class StudentImportCommitRequestDto(
    val rows: List<StudentImportRowDto>,
    val overwriteDuplicates: Boolean
)

data class StudentImportResultDto(
    val totalProcessed: Int,
    val importedCount: Int,
    val updatedCount: Int,
    val skippedCount: Int,
    val failedRows: List<StudentImportRowDto>
)
