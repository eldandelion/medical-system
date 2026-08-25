package com.medicalsystem.backend.service

import com.medicalsystem.backend.model.Gender

/**
 * Ingestion Anti-Corruption Layer (ACL) Schema & Configuration for Student Bulk Import.
 *
 * Encapsulates:
 * - External human-readable CSV header mappings to internal canonical DTO keys.
 * - Ingestion default conventions (default ethnicity "汉族", default email domain "@univ.edu.cn").
 * - Row offset numbers for 1-based header and data rows.
 * - External localized gender alias coercion ("男"/"女"/"M"/"F" -> Gender.MALE/FEMALE).
 * - UTF-8 BOM byte constants for Excel-compatible CSV exports.
 */
object StudentImportSchema {

    /**
     * The row number of the first data row in the CSV file (row 1 is the header).
     */
    const val CSV_FIRST_DATA_ROW_NUMBER = 2

    /**
     * Default ethnicity name applied when ethnicity column is omitted or blank.
     */
    const val DEFAULT_ETHNICITY_NAME = "汉族"

    /**
     * Default degree level code applied when degree level column is omitted or blank.
     */
    const val DEFAULT_DEGREE_LEVEL_CODE = "BACHELOR"

    /**
     * Default email domain suffix used to synthesize student email addresses from student numbers.
     */
    const val DEFAULT_EMAIL_DOMAIN = "@univ.edu.cn"

    /**
     * UTF-8 Byte Order Mark (BOM) for Chinese Excel encoding compatibility.
     */
    val UTF8_BOM: ByteArray = byteArrayOf(0xEF.toByte(), 0xBB.toByte(), 0xBF.toByte())

    /**
     * Canonical DTO field key constants.
     */
    object Fields {
        const val STUDENT_NUMBER = "studentNumber"
        const val NAME = "name"
        const val MAJOR = "major"
        const val ENROLLMENT_DATE = "enrollmentDate"
        const val DEGREE_LEVEL = "degreeLevel"
        const val ID_CARD_NUMBER = "idCardNumber"
        const val GENDER = "gender"
        const val ETHNICITY = "ethnicity"
        const val CONTACT_NUMBER = "contactNumber"
        const val EMAIL = "email"
        const val HOME_ADDRESS = "homeAddress"
        const val EMERGENCY_CONTACT_NAME = "emergencyContactName"
        const val EMERGENCY_CONTACT_PHONE = "emergencyContactPhone"
        const val TEACHER_EMPLOYEE_NUMBER = "teacherEmployeeNumber"
    }

    /**
     * Mapping of human-readable CSV header column names to canonical DTO field keys.
     * Uses [LinkedHashMap] to preserve column order for template CSV generation.
     */
    val HEADER_MAPPINGS: Map<String, String> = linkedMapOf(
        "学号" to Fields.STUDENT_NUMBER,
        "姓名" to Fields.NAME,
        "专业" to Fields.MAJOR,
        "入学日期" to Fields.ENROLLMENT_DATE,
        "培养层次" to Fields.DEGREE_LEVEL,
        "学历层次" to Fields.DEGREE_LEVEL,
        "学历" to Fields.DEGREE_LEVEL,
        "学位" to Fields.DEGREE_LEVEL,
        "degreeLevel" to Fields.DEGREE_LEVEL,
        "身份证号" to Fields.ID_CARD_NUMBER,
        "性别" to Fields.GENDER,
        "民族" to Fields.ETHNICITY,
        "联系电话" to Fields.CONTACT_NUMBER,
        "电子邮箱" to Fields.EMAIL,
        "家庭住址" to Fields.HOME_ADDRESS,
        "紧急联系人" to Fields.EMERGENCY_CONTACT_NAME,
        "紧急联系电话" to Fields.EMERGENCY_CONTACT_PHONE,
        "班主任/辅导员工号" to Fields.TEACHER_EMPLOYEE_NUMBER
    )

    /**
     * Canonical template header columns in display order for template CSV generation.
     */
    val TEMPLATE_HEADERS: List<String> = listOf(
        "学号",
        "姓名",
        "专业",
        "入学日期",
        "培养层次",
        "身份证号",
        "性别",
        "民族",
        "联系电话",
        "电子邮箱",
        "家庭住址",
        "紧急联系人",
        "紧急联系电话",
        "班主任/辅导员工号"
    )

    /**
     * Generate the standard CSV header line for template download.
     */
    fun generateTemplateHeaderCsv(): String =
        TEMPLATE_HEADERS.joinToString(separator = ",", postfix = "\n")

    /**
     * Translate various external string representations (Chinese and English abbreviations)
     * to the strongly typed pure domain [Gender] enum.
     */
    fun parseGenderAlias(raw: String?): Gender? {
        if (raw.isNullOrBlank()) return null
        return when (raw.trim().uppercase()) {
            "男", "MALE", "M" -> Gender.MALE
            "女", "FEMALE", "F" -> Gender.FEMALE
            "其他", "OTHER" -> Gender.OTHER
            else -> null
        }
    }

    /**
     * Synthesize a standard student institutional email if not provided.
     */
    fun synthesizeEmail(studentNumber: String): String =
        "$studentNumber$DEFAULT_EMAIL_DOMAIN"
}
