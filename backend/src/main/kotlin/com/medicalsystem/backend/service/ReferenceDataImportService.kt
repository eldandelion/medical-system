package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.ReferenceCategory
import com.medicalsystem.backend.model.ReferenceDataStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import com.medicalsystem.backend.util.CsvStreamReader
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile

@Service
@Transactional
class ReferenceDataImportService(
    private val collegeJpaRepository: CollegeJpaRepository,
    private val majorJpaRepository: MajorJpaRepository,
    private val schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository,
    private val hospitalRepository: HospitalRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository,
    private val ethnicityJpaRepository: EthnicityJpaRepository,
    private val degreeLevelJpaRepository: DegreeLevelJpaRepository,
    private val academicReferenceService: AcademicReferenceService,
    private val clinicalReferenceService: ClinicalReferenceService,
    private val demographicsReferenceService: DemographicsReferenceService
) {
    private val logger = LoggerFactory.getLogger(ReferenceDataImportService::class.java)

    companion object {
        private val UTF8_BOM = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())
        private val ALLOWED_ROLES = setOf(UserRole.SYSTEM_ADMIN)

        const val HEADER_COLLEGE = "学院名称"
        const val HEADER_MAJOR = "专业名称"
        const val HEADER_COLLEGE_NAME = "所属学院"
        const val HEADER_SCHOOL_DEPT = "部门名称"
        const val HEADER_HOSPITAL = "医院名称"
        const val HEADER_HOSPITAL_ADDRESS = "医院地址"
        const val HEADER_HOSPITAL_PHONE = "联系电话"
        const val HEADER_HOSPITAL_DEPT = "科室名称"
        const val HEADER_HOSPITAL_NAME = "所属医院"
        const val HEADER_ETHNICITY = "民族名称"
        const val HEADER_DEGREE_LEVEL = "培养层次名称"
    }

    fun generateTemplateCsv(category: ReferenceCategory): ByteArray {
        val (header, example) = when (category) {
            ReferenceCategory.COLLEGE -> HEADER_COLLEGE to "计算机学院\n软件学院"
            ReferenceCategory.MAJOR -> "$HEADER_MAJOR,$HEADER_COLLEGE_NAME" to "软件工程,计算机学院\n计算机科学与技术,计算机学院"
            ReferenceCategory.SCHOOL_DEPARTMENT -> HEADER_SCHOOL_DEPT to "心理咨询中心\n学生工作处"
            ReferenceCategory.HOSPITAL -> "$HEADER_HOSPITAL,$HEADER_HOSPITAL_ADDRESS,$HEADER_HOSPITAL_PHONE" to "中南大学湘雅二医院,长沙市人民中路139号,0731-85295888"
            ReferenceCategory.HOSPITAL_DEPARTMENT -> "$HEADER_HOSPITAL_DEPT,$HEADER_HOSPITAL_NAME" to "临床心理科,中南大学湘雅二医院\n精神卫生科,中南大学湘雅二医院"
            ReferenceCategory.ETHNICITY -> HEADER_ETHNICITY to "汉族\n壮族\n回族"
            ReferenceCategory.DEGREE_LEVEL -> HEADER_DEGREE_LEVEL to "本科生\n硕士研究生\n博士研究生"
        }
        val csvText = "$header\n$example\n"
        return UTF8_BOM + csvText.toByteArray(Charsets.UTF_8)
    }

    @Transactional(readOnly = true)
    fun previewCsv(category: ReferenceCategory, file: MultipartFile): ReferenceImportPreviewDto {
        val rawRows = CsvStreamReader.parse(file.bytes)
        val validatedRows = validateRows(category, rawRows)

        return ReferenceImportPreviewDto(
            category = category,
            totalRows = validatedRows.size,
            readyCount = validatedRows.count { it.status == "READY" },
            duplicateCount = validatedRows.count { it.status == "DUPLICATE" },
            invalidCount = validatedRows.count { it.status == "INVALID" },
            rows = validatedRows
        )
    }

    fun commitImport(request: ReferenceImportCommitRequestDto, currentUser: User): ReferenceImportResultDto {
        if (currentUser.role !in ALLOWED_ROLES) {
            throw ForbiddenException("Only System Administrators may import reference data.")
        }

        var importedCount = 0
        var updatedCount = 0
        var skippedCount = 0
        val failedRows = mutableListOf<ReferenceImportRowDto>()

        val rawMaps = request.rows.map { rowToRawMap(request.category, it) }
        val revalidatedRows = validateRows(request.category, rawMaps)

        revalidatedRows.forEach { row ->
            when {
                row.status == "INVALID" -> failedRows.add(row)
                row.status == "READY" -> {
                    try {
                        createItem(request.category, row)
                        importedCount++
                    } catch (e: Exception) {
                        logger.error("Failed to create ${request.category} row: ${row.name}", e)
                        failedRows.add(row.copy(status = "INVALID", errorCode = e.message ?: "CREATION_FAILED"))
                    }
                }
                row.status == "DUPLICATE" && request.overwriteDuplicates -> {
                    try {
                        updateItem(request.category, row)
                        updatedCount++
                    } catch (e: Exception) {
                        logger.error("Failed to update ${request.category} row: ${row.name}", e)
                        failedRows.add(row.copy(status = "INVALID", errorCode = e.message ?: "UPDATE_FAILED"))
                    }
                }
                row.status == "DUPLICATE" && !request.overwriteDuplicates -> {
                    skippedCount++
                }
            }
        }

        return ReferenceImportResultDto(
            category = request.category,
            totalProcessed = revalidatedRows.size,
            importedCount = importedCount,
            updatedCount = updatedCount,
            skippedCount = skippedCount,
            failedRows = failedRows
        )
    }

    private fun validateRows(category: ReferenceCategory, rawRows: List<Map<String, String>>): List<ReferenceImportRowDto> {
        val collegesMap = collegeJpaRepository.findAll().associateBy { it.name }
        val hospitalsMap = hospitalRepository.findAll().associateBy { it.name }
        val majorsSet = majorJpaRepository.findAll().map { "${it.name}#${it.college.name}" }.toSet()
        val schoolDeptsSet = schoolDepartmentJpaRepository.findAll().map { it.name }.toSet()
        val hospDeptsSet = hospitalDepartmentRepository.findAll().map { "${it.name}#${it.hospital.name}" }.toSet()
        val ethnicitiesSet = ethnicityJpaRepository.findAll().map { it.name }.toSet()
        val degreeLevelsSet = degreeLevelJpaRepository.findAll().map { it.name }.toSet()

        return rawRows.mapIndexed { index, map ->
            val rowNum = index + 2 // 1-based index with header at row 1
            when (category) {
                ReferenceCategory.COLLEGE -> {
                    val name = map[HEADER_COLLEGE]?.trim() ?: ""
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, errorCode = "NAME_REQUIRED")
                        collegesMap.containsKey(name) -> ReferenceImportRowDto(rowNum, "DUPLICATE", name)
                        else -> ReferenceImportRowDto(rowNum, "READY", name)
                    }
                }
                ReferenceCategory.MAJOR -> {
                    val name = map[HEADER_MAJOR]?.trim() ?: ""
                    val parentName = map[HEADER_COLLEGE_NAME]?.trim() ?: ""
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, parentName, errorCode = "NAME_REQUIRED")
                        parentName.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, parentName, errorCode = "PARENT_REQUIRED")
                        !collegesMap.containsKey(parentName) -> ReferenceImportRowDto(rowNum, "INVALID", name, parentName, errorCode = "PARENT_NOT_FOUND")
                        majorsSet.contains("$name#$parentName") || majorJpaRepository.findByName(name) != null ->
                            ReferenceImportRowDto(rowNum, "DUPLICATE", name, parentName)
                        else -> ReferenceImportRowDto(rowNum, "READY", name, parentName)
                    }
                }
                ReferenceCategory.SCHOOL_DEPARTMENT -> {
                    val name = map[HEADER_SCHOOL_DEPT]?.trim() ?: ""
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, errorCode = "NAME_REQUIRED")
                        schoolDeptsSet.contains(name) -> ReferenceImportRowDto(rowNum, "DUPLICATE", name)
                        else -> ReferenceImportRowDto(rowNum, "READY", name)
                    }
                }
                ReferenceCategory.HOSPITAL -> {
                    val name = map[HEADER_HOSPITAL]?.trim() ?: ""
                    val address = map[HEADER_HOSPITAL_ADDRESS]?.trim()?.ifBlank { null }
                    val phone = map[HEADER_HOSPITAL_PHONE]?.trim()?.ifBlank { null }
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, address = address, contactPhone = phone, errorCode = "NAME_REQUIRED")
                        hospitalsMap.containsKey(name) -> ReferenceImportRowDto(rowNum, "DUPLICATE", name, address = address, contactPhone = phone)
                        else -> ReferenceImportRowDto(rowNum, "READY", name, address = address, contactPhone = phone)
                    }
                }
                ReferenceCategory.HOSPITAL_DEPARTMENT -> {
                    val name = map[HEADER_HOSPITAL_DEPT]?.trim() ?: ""
                    val parentName = map[HEADER_HOSPITAL_NAME]?.trim() ?: ""
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, parentName, errorCode = "NAME_REQUIRED")
                        parentName.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, parentName, errorCode = "PARENT_REQUIRED")
                        !hospitalsMap.containsKey(parentName) -> ReferenceImportRowDto(rowNum, "INVALID", name, parentName, errorCode = "PARENT_NOT_FOUND")
                        hospDeptsSet.contains("$name#$parentName") -> ReferenceImportRowDto(rowNum, "DUPLICATE", name, parentName)
                        else -> ReferenceImportRowDto(rowNum, "READY", name, parentName)
                    }
                }
                ReferenceCategory.ETHNICITY -> {
                    val name = map[HEADER_ETHNICITY]?.trim() ?: ""
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, errorCode = "NAME_REQUIRED")
                        ethnicitiesSet.contains(name) -> ReferenceImportRowDto(rowNum, "DUPLICATE", name)
                        else -> ReferenceImportRowDto(rowNum, "READY", name)
                    }
                }
                ReferenceCategory.DEGREE_LEVEL -> {
                    val name = map[HEADER_DEGREE_LEVEL]?.trim() ?: ""
                    when {
                        name.isBlank() -> ReferenceImportRowDto(rowNum, "INVALID", name, errorCode = "NAME_REQUIRED")
                        degreeLevelsSet.contains(name) -> ReferenceImportRowDto(rowNum, "DUPLICATE", name)
                        else -> ReferenceImportRowDto(rowNum, "READY", name)
                    }
                }
            }
        }
    }

    private fun createItem(category: ReferenceCategory, row: ReferenceImportRowDto) {
        when (category) {
            ReferenceCategory.COLLEGE -> academicReferenceService.createCollege(SaveCollegeRequest(row.name))
            ReferenceCategory.MAJOR -> {
                val college = collegeJpaRepository.findByName(row.parentName ?: "")
                    ?: error("College '${row.parentName}' not found")
                academicReferenceService.createMajor(SaveMajorRequest(row.name, college.id ?: 0L))
            }
            ReferenceCategory.SCHOOL_DEPARTMENT -> academicReferenceService.createSchoolDepartment(SaveSchoolDepartmentRequest(row.name))
            ReferenceCategory.HOSPITAL -> clinicalReferenceService.createHospital(SaveHospitalRequest(row.name, row.address, row.contactPhone))
            ReferenceCategory.HOSPITAL_DEPARTMENT -> {
                val hospital = hospitalRepository.findByName(row.parentName ?: "")
                    ?: error("Hospital '${row.parentName}' not found")
                clinicalReferenceService.createHospitalDepartment(SaveHospitalDepartmentRequest(row.name, hospital.id))
            }
            ReferenceCategory.ETHNICITY -> demographicsReferenceService.createEthnicity(SaveSimpleReferenceRequest(row.name))
            ReferenceCategory.DEGREE_LEVEL -> demographicsReferenceService.createDegreeLevel(SaveSimpleReferenceRequest(row.name))
        }
    }

    private fun updateItem(category: ReferenceCategory, row: ReferenceImportRowDto) {
        when (category) {
            ReferenceCategory.COLLEGE -> {
                val entity = collegeJpaRepository.findByName(row.name) ?: return
                academicReferenceService.updateCollege(entity.id ?: 0L, SaveCollegeRequest(row.name))
            }
            ReferenceCategory.MAJOR -> {
                val entity = majorJpaRepository.findByName(row.name) ?: return
                val college = collegeJpaRepository.findByName(row.parentName ?: "") ?: return
                academicReferenceService.updateMajor(entity.id ?: 0L, SaveMajorRequest(row.name, college.id ?: 0L))
            }
            ReferenceCategory.SCHOOL_DEPARTMENT -> {
                val entity = schoolDepartmentJpaRepository.findByName(row.name) ?: return
                academicReferenceService.updateSchoolDepartment(entity.id, SaveSchoolDepartmentRequest(row.name))
            }
            ReferenceCategory.HOSPITAL -> {
                val entity = hospitalRepository.findByName(row.name) ?: return
                clinicalReferenceService.updateHospital(entity.id, SaveHospitalRequest(row.name, row.address, row.contactPhone))
            }
            ReferenceCategory.HOSPITAL_DEPARTMENT -> {
                val hospital = hospitalRepository.findByName(row.parentName ?: "") ?: return
                val entity = hospitalDepartmentRepository.findByHospitalId(hospital.id).find { it.name == row.name } ?: return
                clinicalReferenceService.updateHospitalDepartment(entity.id, SaveHospitalDepartmentRequest(row.name, hospital.id))
            }
            ReferenceCategory.ETHNICITY -> {
                val entity = ethnicityJpaRepository.findByName(row.name).orElse(null) ?: return
                demographicsReferenceService.updateEthnicity(entity.id, SaveSimpleReferenceRequest(row.name))
            }
            ReferenceCategory.DEGREE_LEVEL -> {
                val entity = degreeLevelJpaRepository.findByName(row.name).orElse(null) ?: return
                demographicsReferenceService.updateDegreeLevel(entity.id, SaveSimpleReferenceRequest(row.name))
            }
        }
    }

    private fun rowToRawMap(category: ReferenceCategory, row: ReferenceImportRowDto): Map<String, String> {
        return when (category) {
            ReferenceCategory.COLLEGE -> mapOf(HEADER_COLLEGE to row.name)
            ReferenceCategory.MAJOR -> mapOf(HEADER_MAJOR to row.name, HEADER_COLLEGE_NAME to (row.parentName ?: ""))
            ReferenceCategory.SCHOOL_DEPARTMENT -> mapOf(HEADER_SCHOOL_DEPT to row.name)
            ReferenceCategory.HOSPITAL -> mapOf(HEADER_HOSPITAL to row.name, HEADER_HOSPITAL_ADDRESS to (row.address ?: ""), HEADER_HOSPITAL_PHONE to (row.contactPhone ?: ""))
            ReferenceCategory.HOSPITAL_DEPARTMENT -> mapOf(HEADER_HOSPITAL_DEPT to row.name, HEADER_HOSPITAL_NAME to (row.parentName ?: ""))
            ReferenceCategory.ETHNICITY -> mapOf(HEADER_ETHNICITY to row.name)
            ReferenceCategory.DEGREE_LEVEL -> mapOf(HEADER_DEGREE_LEVEL to row.name)
        }
    }
}
