package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentImportErrorCode
import com.medicalsystem.backend.dto.StudentImportFieldErrorDto
import com.medicalsystem.backend.dto.StudentImportRowDto
import com.medicalsystem.backend.dto.StudentImportStatus
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.IdCardNumber
import com.medicalsystem.backend.model.MobileNumber
import com.medicalsystem.backend.model.PhoneNumber
import com.medicalsystem.backend.service.StudentImportSchema.Fields
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.time.format.DateTimeParseException

/**
 * Pure in-memory row validator for CSV student bulk import.
 *
 * Adheres to DDD and Clean Code principles:
 * - Delegates all format validation predicates to Domain Value Objects ([IdCardNumber], [MobileNumber], [EmailAddress], [PhoneNumber]).
 * - Delegates header mapping, defaults, and aliases to [StudentImportSchema] (Ingestion ACL).
 * - Decomposed into single-responsibility step-down helper functions.
 * - Operates without JPA dependencies on pre-fetched dictionary maps to avoid N+1 query hazards.
 */
@Component
class StudentImportValidator {

    /**
     * Validate a list of raw CSV row maps against pre-fetched dictionaries.
     *
     * @param rawRows             Raw header→value maps from [CsvStreamReader].
     * @param majorsMap           Map of major name → [MajorEntity] (pre-fetched).
     * @param ethnicitiesMap      Map of ethnicity name → [EthnicityEntity] (pre-fetched).
     * @param teachersMap         Map of employee number → [TeacherEntity] (pre-fetched).
     * @param existingStudentNums Set of all student numbers already in the database (pre-fetched).
     * @return List of validated [StudentImportRowDto], each classified as READY / DUPLICATE / INVALID.
     */
    fun validateRows(
        rawRows: List<Map<String, String>>,
        majorsMap: Map<String, MajorEntity>,
        ethnicitiesMap: Map<String, EthnicityEntity>,
        teachersMap: Map<String, TeacherEntity>,
        existingStudentNums: Set<String>
    ): List<StudentImportRowDto> {
        val seenStudentNumbers = mutableSetOf<String>()

        return rawRows.mapIndexed { index, rawRow ->
            val row = normalizeRow(rawRow)
            val rowNumber = index + StudentImportSchema.CSV_FIRST_DATA_ROW_NUMBER

            validateRow(
                rowNumber = rowNumber,
                row = row,
                majorsMap = majorsMap,
                ethnicitiesMap = ethnicitiesMap,
                teachersMap = teachersMap,
                existingStudentNums = existingStudentNums,
                seenStudentNumbers = seenStudentNumbers
            )
        }
    }

    private fun normalizeRow(rawRow: Map<String, String>): Map<String, String> {
        val normalized = mutableMapOf<String, String>()
        rawRow.forEach { (key, value) ->
            val mappedKey = StudentImportSchema.HEADER_MAPPINGS[key] ?: key
            normalized[mappedKey] = value
        }
        return normalized
    }

    private fun validateRow(
        rowNumber: Int,
        row: Map<String, String>,
        majorsMap: Map<String, MajorEntity>,
        ethnicitiesMap: Map<String, EthnicityEntity>,
        teachersMap: Map<String, TeacherEntity>,
        existingStudentNums: Set<String>,
        seenStudentNumbers: MutableSet<String>
    ): StudentImportRowDto {
        val errors = mutableListOf<StudentImportFieldErrorDto>()

        // 1. Validate required fields presence
        val studentNumber = validateRequiredField(Fields.STUDENT_NUMBER, row, errors)
        val name = validateRequiredField(Fields.NAME, row, errors)
        val majorName = validateRequiredField(Fields.MAJOR, row, errors)
        val enrollmentDateRaw = validateRequiredField(Fields.ENROLLMENT_DATE, row, errors)
        val idCardRaw = validateRequiredField(Fields.ID_CARD_NUMBER, row, errors)

        // 2. Validate major against pre-fetched dictionary
        validateMajor(majorName, majorsMap, errors)

        // 3. Parse and validate enrollment date
        val enrollmentDate = parseAndValidateDate(enrollmentDateRaw, errors)

        // 4. Validate ID card against Domain Value Object predicate
        val idCardNumber = validateIdCardNumber(idCardRaw, errors)

        // 5. Validate optional demographics, contacts, and teacher
        val gender = StudentImportSchema.parseGenderAlias(row[Fields.GENDER])
        val ethnicityName = validateEthnicity(row[Fields.ETHNICITY], ethnicitiesMap, errors)
        val contactNumber = validateMobileNumber(row[Fields.CONTACT_NUMBER], errors)
        val email = resolveAndValidateEmail(row[Fields.EMAIL], studentNumber, errors)
        val emergencyContactPhone = validateEmergencyPhone(row[Fields.EMERGENCY_CONTACT_PHONE], errors)
        val teacherEmployeeNumber = validateTeacher(row[Fields.TEACHER_EMPLOYEE_NUMBER], teachersMap, errors)

        val homeAddress = row[Fields.HOME_ADDRESS]?.takeIf { it.isNotBlank() }
        val emergencyContactName = row[Fields.EMERGENCY_CONTACT_NAME]?.takeIf { it.isNotBlank() }

        // 6. Determine row status and intra-file / database duplicates
        val status = determineStatus(
            studentNumber = studentNumber,
            errors = errors,
            seenStudentNumbers = seenStudentNumbers,
            existingStudentNums = existingStudentNums
        )

        // Register studentNumber in intra-file tracking set
        if (studentNumber != null) {
            seenStudentNumbers.add(studentNumber)
        }

        return StudentImportRowDto(
            rowNumber = rowNumber,
            studentNumber = studentNumber ?: "",
            name = name ?: "",
            major = majorName ?: "",
            enrollmentDate = enrollmentDate,
            idCardNumber = idCardNumber,
            gender = gender?.name,
            ethnicity = ethnicityName,
            contactNumber = contactNumber,
            email = email,
            homeAddress = homeAddress,
            emergencyContactName = emergencyContactName,
            emergencyContactPhone = emergencyContactPhone,
            teacherEmployeeNumber = teacherEmployeeNumber,
            status = status,
            errors = errors
        )
    }

    // --- Step-Down Helper Functions ---

    private fun validateRequiredField(
        fieldKey: String,
        row: Map<String, String>,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String? {
        val value = row[fieldKey]?.takeIf { it.isNotBlank() }
        if (value == null) {
            errors.add(StudentImportFieldErrorDto(fieldKey, StudentImportErrorCode.REQUIRED_FIELD_MISSING))
        }
        return value
    }

    private fun validateMajor(
        majorName: String?,
        majorsMap: Map<String, MajorEntity>,
        errors: MutableList<StudentImportFieldErrorDto>
    ) {
        if (majorName != null && !majorsMap.containsKey(majorName)) {
            errors.add(StudentImportFieldErrorDto(Fields.MAJOR, StudentImportErrorCode.MAJOR_NOT_FOUND, majorName))
        }
    }

    private fun parseAndValidateDate(
        rawDate: String?,
        errors: MutableList<StudentImportFieldErrorDto>
    ): LocalDate? {
        val dateRaw = rawDate?.takeIf { it.isNotBlank() } ?: return null
        val parsed = parseDate(dateRaw)
        if (parsed == null) {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.ENROLLMENT_DATE,
                    StudentImportErrorCode.INVALID_DATE_FORMAT,
                    dateRaw
                )
            )
        }
        return parsed
    }

    private fun validateIdCardNumber(
        rawIdCard: String?,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String? {
        val idCardRaw = rawIdCard?.takeIf { it.isNotBlank() } ?: return null
        return if (IdCardNumber.isValid(idCardRaw)) {
            idCardRaw
        } else {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.ID_CARD_NUMBER,
                    StudentImportErrorCode.INVALID_ID_CARD_FORMAT,
                    idCardRaw
                )
            )
            null
        }
    }

    private fun validateEthnicity(
        rawEthnicity: String?,
        ethnicitiesMap: Map<String, EthnicityEntity>,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String {
        val ethnicityName = rawEthnicity?.takeIf { it.isNotBlank() } ?: StudentImportSchema.DEFAULT_ETHNICITY_NAME
        if (rawEthnicity?.isNotBlank() == true && !ethnicitiesMap.containsKey(ethnicityName)) {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.ETHNICITY,
                    StudentImportErrorCode.ETHNICITY_NOT_FOUND,
                    ethnicityName
                )
            )
        }
        return ethnicityName
    }

    private fun validateMobileNumber(
        rawMobile: String?,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String? {
        val mobileRaw = rawMobile?.takeIf { it.isNotBlank() } ?: return null
        return if (MobileNumber.isValid(mobileRaw)) {
            mobileRaw
        } else {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.CONTACT_NUMBER,
                    StudentImportErrorCode.INVALID_PHONE_FORMAT,
                    mobileRaw
                )
            )
            null
        }
    }

    private fun resolveAndValidateEmail(
        rawEmail: String?,
        studentNumber: String?,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String? {
        val emailRaw = rawEmail?.takeIf { it.isNotBlank() }
        if (emailRaw != null) {
            return if (EmailAddress.isValid(emailRaw)) {
                emailRaw
            } else {
                errors.add(
                    StudentImportFieldErrorDto(
                        Fields.EMAIL,
                        StudentImportErrorCode.INVALID_EMAIL_FORMAT,
                        emailRaw
                    )
                )
                null
            }
        }
        // Synthesize default institutional email when omitted or blank
        return if (studentNumber != null) {
            StudentImportSchema.synthesizeEmail(studentNumber)
        } else {
            null
        }
    }

    private fun validateEmergencyPhone(
        rawPhone: String?,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String? {
        val phoneRaw = rawPhone?.takeIf { it.isNotBlank() } ?: return null
        return if (PhoneNumber.isValid(phoneRaw)) {
            phoneRaw
        } else {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.EMERGENCY_CONTACT_PHONE,
                    StudentImportErrorCode.INVALID_PHONE_FORMAT,
                    phoneRaw
                )
            )
            null
        }
    }

    private fun validateTeacher(
        teacherEmpNo: String?,
        teachersMap: Map<String, TeacherEntity>,
        errors: MutableList<StudentImportFieldErrorDto>
    ): String? {
        val teacherRaw = teacherEmpNo?.takeIf { it.isNotBlank() } ?: return null
        if (!teachersMap.containsKey(teacherRaw)) {
            errors.add(
                StudentImportFieldErrorDto(
                    Fields.TEACHER_EMPLOYEE_NUMBER,
                    StudentImportErrorCode.TEACHER_NOT_FOUND,
                    teacherRaw
                )
            )
        }
        return teacherRaw
    }

    private fun determineStatus(
        studentNumber: String?,
        errors: MutableList<StudentImportFieldErrorDto>,
        seenStudentNumbers: Set<String>,
        existingStudentNums: Set<String>
    ): StudentImportStatus {
        return when {
            errors.isNotEmpty() -> StudentImportStatus.INVALID
            studentNumber != null && seenStudentNumbers.contains(studentNumber) -> {
                errors.add(
                    StudentImportFieldErrorDto(
                        Fields.STUDENT_NUMBER,
                        StudentImportErrorCode.INTRA_FILE_DUPLICATE,
                        studentNumber
                    )
                )
                StudentImportStatus.INVALID
            }
            studentNumber != null && existingStudentNums.contains(studentNumber) -> {
                errors.add(
                    StudentImportFieldErrorDto(
                        Fields.STUDENT_NUMBER,
                        StudentImportErrorCode.DUPLICATE_IN_DATABASE,
                        studentNumber
                    )
                )
                StudentImportStatus.DUPLICATE
            }
            else -> StudentImportStatus.READY
        }
    }

    private fun parseDate(raw: String): LocalDate? {
        val normalized = raw.trim().replace('/', '-')
        // Full date: yyyy-MM-dd
        try {
            return LocalDate.parse(normalized, DateTimeFormatter.ofPattern("yyyy-MM-dd"))
        } catch (_: DateTimeParseException) {}

        // Year-month only: yyyy-MM → default to 1st
        try {
            return LocalDate.parse("$normalized-01", DateTimeFormatter.ofPattern("yyyy-MM-dd"))
        } catch (_: DateTimeParseException) {}

        return null
    }
}
