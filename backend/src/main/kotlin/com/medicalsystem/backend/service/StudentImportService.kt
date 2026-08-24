package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentImportCommitRequestDto
import com.medicalsystem.backend.dto.StudentImportPreviewDto
import com.medicalsystem.backend.dto.StudentImportResultDto
import com.medicalsystem.backend.dto.StudentImportRowDto
import com.medicalsystem.backend.dto.StudentImportStatus
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.StudentRegisteredEvent
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.StudentHealthProfileFactory
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.repository.MajorJpaRepository
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.TeacherRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import com.medicalsystem.backend.service.StudentImportSchema.Fields
import com.medicalsystem.backend.util.CsvStreamReader
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.time.LocalDate

/**
 * Application service orchestrating the student bulk CSV import workflow.
 *
 * Responsibilities:
 * 1. Template generation (using [StudentImportSchema])
 * 2. CSV parsing and preview validation (stateless — no DB writes)
 * 3. Transactional commit: new student registration + existing student update
 *
 * Uses [CsvStreamReader] for parsing and [StudentImportValidator] for row-level validation.
 * Batch-prefetches all dictionaries before validation to eliminate N+1 query hazards.
 */
@Service
@Transactional(readOnly = true)
class StudentImportService(
    private val majorJpaRepository: MajorJpaRepository,
    private val ethnicityJpaRepository: EthnicityJpaRepository,
    private val teacherRepository: TeacherRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val userJpaRepository: UserJpaRepository,
    private val healthProfileRepository: StudentHealthProfileRepository,
    private val validator: StudentImportValidator,
    private val eventPublisher: DomainEventPublisher
) {
    private val logger = LoggerFactory.getLogger(StudentImportService::class.java)

    companion object {
        private val ALLOWED_IMPORT_ROLES = setOf(UserRole.SYSTEM_ADMIN, UserRole.HEAD_COUNSELLOR)
    }

    /**
     * Generate and return a UTF-8 BOM-prefixed CSV template file for download.
     * The BOM ensures correct rendering when opened in Chinese Excel.
     */
    fun generateTemplateCsv(): ByteArray {
        val bom = StudentImportSchema.UTF8_BOM
        val content = StudentImportSchema.generateTemplateHeaderCsv().toByteArray(Charsets.UTF_8)
        return bom + content
    }

    /**
     * Parse and validate a CSV upload, returning a full preview without writing to DB.
     *
     * Dictionary pre-fetching strategy:
     * - All majors, ethnicities, teachers fetched in O(1) DB trips before row loop.
     * - Existing student numbers fetched in a single batch JPQL query.
     */
    fun previewCsv(file: MultipartFile): StudentImportPreviewDto {
        val bytes = file.bytes
        val rawRows = CsvStreamReader.parse(bytes)

        // Batch pre-fetch all dictionaries (zero queries inside the row loop)
        val majorsMap = majorJpaRepository.findAll().associateBy { it.name }
        val ethnicitiesMap = ethnicityJpaRepository.findAll().associateBy { it.name }
        val teachersMap = teacherRepository.findAll().associateBy { it.employeeNumber }
        val existingStudentNums = studentJpaRepository.findAllStudentNumbers()

        val rows = validator.validateRows(rawRows, majorsMap, ethnicitiesMap, teachersMap, existingStudentNums)

        return StudentImportPreviewDto(
            totalRows = rows.size,
            readyCount = rows.count { it.status == StudentImportStatus.READY },
            duplicateCount = rows.count { it.status == StudentImportStatus.DUPLICATE },
            invalidCount = rows.count { it.status == StudentImportStatus.INVALID },
            rows = rows
        )
    }

    /**
     * Commit the import. Re-validates all rows server-side to prevent client-side payload tampering.
     *
     * For [StudentImportStatus.READY] rows: creates new [UserEntity] + [StudentEntity] +
     * initial health profile, dispatches [StudentRegisteredEvent].
     *
     * For [StudentImportStatus.DUPLICATE] rows with [overwriteDuplicates] = true:
     * updates name, major, enrollmentDate, demographics, and assignedTeacher in place.
     * Existing health profiles and clinical referrals are strictly preserved.
     */
    @Transactional
    fun commitImport(request: StudentImportCommitRequestDto, currentUser: User): StudentImportResultDto {
        if (currentUser.role !in ALLOWED_IMPORT_ROLES) {
            throw ForbiddenException("Only System Administrators and Head Counsellors may import students.")
        }

        // Re-validate all rows to prevent client-side tampering
        val majorsMap = majorJpaRepository.findAll().associateBy { it.name }
        val ethnicitiesMap = ethnicityJpaRepository.findAll().associateBy { it.name }
        val teachersMap = teacherRepository.findAll().associateBy { it.employeeNumber }
        val existingStudentNums = studentJpaRepository.findAllStudentNumbers()

        val rawMaps = request.rows.map { rowToRawMap(it) }
        val revalidatedRows = validator.validateRows(
            rawMaps,
            majorsMap,
            ethnicitiesMap,
            teachersMap,
            existingStudentNums
        ).mapIndexed { index, validatedRow ->
            validatedRow.copy(rowNumber = request.rows[index].rowNumber)
        }

        var importedCount = 0
        var updatedCount = 0
        var skippedCount = 0
        val failedRows = mutableListOf<StudentImportRowDto>()

        revalidatedRows.forEach { row ->
            when {
                row.status == StudentImportStatus.INVALID -> {
                    failedRows.add(row)
                }

                row.status == StudentImportStatus.READY -> {
                    try {
                        registerNewStudent(row)
                        importedCount++
                        logger.info("Imported new student: ${row.studentNumber}")
                    } catch (ex: Exception) {
                        logger.error("Failed to import student ${row.studentNumber}: ${ex.message}")
                        failedRows.add(row)
                    }
                }

                row.status == StudentImportStatus.DUPLICATE && request.overwriteDuplicates -> {
                    try {
                        updateExistingStudent(row)
                        updatedCount++
                        logger.info("Updated existing student: ${row.studentNumber}")
                    } catch (ex: Exception) {
                        logger.error("Failed to update student ${row.studentNumber}: ${ex.message}")
                        failedRows.add(row)
                    }
                }

                row.status == StudentImportStatus.DUPLICATE && !request.overwriteDuplicates -> {
                    skippedCount++
                }
            }
        }

        logger.info(
            "Bulk import completed: imported=$importedCount, updated=$updatedCount, " +
                    "skipped=$skippedCount, failed=${failedRows.size}"
        )

        return StudentImportResultDto(
            totalProcessed = revalidatedRows.size,
            importedCount = importedCount,
            updatedCount = updatedCount,
            skippedCount = skippedCount,
            failedRows = failedRows
        )
    }

    private fun registerNewStudent(row: StudentImportRowDto) {
        val majorEntity = majorJpaRepository.findByName(row.major)
            ?: error("Major '${row.major}' not found during commit")

        val email = row.email ?: StudentImportSchema.synthesizeEmail(row.studentNumber)
        val userEntity = UserEntity(
            name = row.name,
            role = UserRole.STUDENT,
            email = EmailAddress(email),
            status = AccountStatus.ACTIVE
        )
        val savedUser = userJpaRepository.save(userEntity)

        val teacherEntity = row.teacherEmployeeNumber?.let {
            teacherRepository.findByEmployeeNumber(it)
        }

        val ethnicityEntity = row.ethnicity?.let {
            ethnicityJpaRepository.findByName(it).orElse(null)
        }

        val demographics = StudentDemographicsEntity(
            gender = StudentImportSchema.parseGenderAlias(row.gender),
            idCardNumber = row.idCardNumber,
            contactNumber = row.contactNumber,
            email = email,
            homeAddress = row.homeAddress,
            emergencyContactName = row.emergencyContactName,
            emergencyContactPhone = row.emergencyContactPhone,
            ethnicity = ethnicityEntity
        )

        val studentEntity = StudentEntity(
            id = savedUser.id,
            studentNumber = row.studentNumber,
            name = row.name,
            major = majorEntity,
            enrollmentDate = row.enrollmentDate ?: LocalDate.now(),
            demographics = demographics,
            assignedTeacher = teacherEntity
        )
        studentJpaRepository.save(studentEntity)

        val healthProfile = StudentHealthProfileFactory.createInitialProfile(savedUser.id)
        healthProfileRepository.save(healthProfile)

        eventPublisher.publish(
            StudentRegisteredEvent(studentId = savedUser.id, riskLevel = null)
        )
    }

    private fun updateExistingStudent(row: StudentImportRowDto) {
        val existingStudent = studentJpaRepository.findByStudentNumber(row.studentNumber)
            ?: error("Student '${row.studentNumber}' not found for update")

        val majorEntity = majorJpaRepository.findByName(row.major)
            ?: error("Major '${row.major}' not found during commit")

        val teacherEntity = row.teacherEmployeeNumber?.let {
            teacherRepository.findByEmployeeNumber(it)
        }

        val ethnicityEntity = row.ethnicity?.let {
            ethnicityJpaRepository.findByName(it).orElse(null)
        }

        // Update demographic and academic fields only — clinical history is preserved
        existingStudent.name = row.name
        existingStudent.major = majorEntity
        if (row.enrollmentDate != null) {
            existingStudent.enrollmentDate = row.enrollmentDate
        }
        existingStudent.assignedTeacher = teacherEntity

        val current = existingStudent.demographics ?: StudentDemographicsEntity()
        existingStudent.demographics = current.copy(
            gender = StudentImportSchema.parseGenderAlias(row.gender) ?: current.gender,
            idCardNumber = row.idCardNumber ?: current.idCardNumber,
            contactNumber = row.contactNumber ?: current.contactNumber,
            email = row.email ?: current.email,
            homeAddress = row.homeAddress ?: current.homeAddress,
            emergencyContactName = row.emergencyContactName ?: current.emergencyContactName,
            emergencyContactPhone = row.emergencyContactPhone ?: current.emergencyContactPhone,
            ethnicity = ethnicityEntity ?: current.ethnicity
        )

        studentJpaRepository.save(existingStudent)
    }

    private fun rowToRawMap(row: StudentImportRowDto): Map<String, String> = mapOf(
        Fields.STUDENT_NUMBER to row.studentNumber,
        Fields.NAME to row.name,
        Fields.MAJOR to row.major,
        Fields.ENROLLMENT_DATE to (row.enrollmentDate?.toString() ?: ""),
        Fields.ID_CARD_NUMBER to (row.idCardNumber ?: ""),
        Fields.GENDER to (row.gender ?: ""),
        Fields.ETHNICITY to (row.ethnicity ?: ""),
        Fields.CONTACT_NUMBER to (row.contactNumber ?: ""),
        Fields.EMAIL to (row.email ?: ""),
        Fields.HOME_ADDRESS to (row.homeAddress ?: ""),
        Fields.EMERGENCY_CONTACT_NAME to (row.emergencyContactName ?: ""),
        Fields.EMERGENCY_CONTACT_PHONE to (row.emergencyContactPhone ?: ""),
        Fields.TEACHER_EMPLOYEE_NUMBER to (row.teacherEmployeeNumber ?: "")
    )
}
