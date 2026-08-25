package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.StudentImportErrorCode
import com.medicalsystem.backend.dto.StudentImportStatus
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.TeacherEntity
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class StudentImportValidatorTest {

    private lateinit var validator: StudentImportValidator

    // Test fixture data
    private lateinit var majorsMap: Map<String, MajorEntity>
    private lateinit var ethnicitiesMap: Map<String, EthnicityEntity>
    private lateinit var teachersMap: Map<String, TeacherEntity>
    private lateinit var existingStudentNums: Set<String>

    @BeforeEach
    fun setUp() {
        validator = StudentImportValidator()

        val college = CollegeEntity(name = "工学院")
        majorsMap = mapOf(
            "计算机科学" to MajorEntity(name = "计算机科学", college = college)
        )
        ethnicitiesMap = mapOf(
            "汉族" to EthnicityEntity(name = "汉族")
        )
        val teacher = TeacherEntity(userId = 1L, employeeNumber = "EMP-00001", college = college)
        teachersMap = mapOf("EMP-00001" to teacher)
        existingStudentNums = setOf("S2023001")
    }

    private fun validRow(
        studentNumber: String = "S2026001",
        name: String = "陈志远",
        major: String = "计算机科学",
        enrollmentDate: String = "2026-09-01",
        idCardNumber: String = "110101200801011234",
        gender: String = "男",
        ethnicity: String = "汉族",
        contactNumber: String = "13800138000",
        email: String = "test@univ.edu.cn",
        teacherEmployeeNumber: String = "EMP-00001"
    ): Map<String, String> = mapOf(
        "学号" to studentNumber,
        "姓名" to name,
        "专业" to major,
        "入学日期" to enrollmentDate,
        "身份证号" to idCardNumber,
        "性别" to gender,
        "民族" to ethnicity,
        "联系电话" to contactNumber,
        "电子邮箱" to email,
        "班主任/辅导员工号" to teacherEmployeeNumber
    )

    @Test
    fun `valid row with all fields is classified as READY`() {
        val rows = validator.validateRows(
            listOf(validRow()),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(1, rows.size)
        assertEquals(StudentImportStatus.READY, rows[0].status)
        assertTrue(rows[0].errors.isEmpty())
    }

    @Test
    fun `existing student number is classified as DUPLICATE`() {
        val rows = validator.validateRows(
            listOf(validRow(studentNumber = "S2023001")),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.DUPLICATE, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.DUPLICATE_IN_DATABASE }
        assertNotNull(error)
    }

    @Test
    fun `second occurrence of same student number in file is INTRA_FILE_DUPLICATE`() {
        val row1 = validRow(studentNumber = "S2026099")
        val row2 = validRow(studentNumber = "S2026099", name = "另一个人")

        val rows = validator.validateRows(
            listOf(row1, row2),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.READY, rows[0].status)
        assertEquals(StudentImportStatus.INVALID, rows[1].status)
        val error = rows[1].errors.find { it.code == StudentImportErrorCode.INTRA_FILE_DUPLICATE }
        assertNotNull(error, "Second occurrence should have INTRA_FILE_DUPLICATE error")
        assertEquals("S2026099", error?.invalidValue)
    }

    @Test
    fun `missing required studentNumber produces REQUIRED_FIELD_MISSING error`() {
        val row = validRow(studentNumber = "")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find {
            it.field == "studentNumber" && it.code == StudentImportErrorCode.REQUIRED_FIELD_MISSING
        }
        assertNotNull(error)
    }

    @Test
    fun `missing required name produces REQUIRED_FIELD_MISSING error`() {
        val row = validRow(name = "")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        assertTrue(rows[0].errors.any { it.field == "name" && it.code == StudentImportErrorCode.REQUIRED_FIELD_MISSING })
    }

    @Test
    fun `non-existent major produces MAJOR_NOT_FOUND error`() {
        val row = validRow(major = "不存在的专业")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.MAJOR_NOT_FOUND }
        assertNotNull(error)
        assertEquals("不存在的专业", error?.invalidValue)
    }

    @Test
    fun `invalid 18-digit ID card produces INVALID_ID_CARD_FORMAT error`() {
        val row = validRow(idCardNumber = "123456")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.INVALID_ID_CARD_FORMAT }
        assertNotNull(error)
        assertEquals("123456", error?.invalidValue)
    }

    @Test
    fun `invalid mobile number produces INVALID_PHONE_FORMAT error`() {
        val row = validRow(contactNumber = "12345")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.INVALID_PHONE_FORMAT }
        assertNotNull(error)
    }

    @Test
    fun `invalid email produces INVALID_EMAIL_FORMAT error`() {
        val row = validRow(email = "not-an-email")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.INVALID_EMAIL_FORMAT }
        assertNotNull(error)
    }

    @Test
    fun `row without email gets synthesized default email`() {
        val rowMap = mapOf(
            "学号" to "S2026002",
            "姓名" to "王小明",
            "专业" to "计算机科学",
            "入学日期" to "2026-09-01",
            "身份证号" to "110101200801011234",
            "性别" to "",
            "民族" to "汉族",
            "联系电话" to "",
            "电子邮箱" to "",
            "班主任/辅导员工号" to ""
        )

        val rows = validator.validateRows(
            listOf(rowMap),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.READY, rows[0].status)
        assertEquals("S2026002@univ.edu.cn", rows[0].email)
    }

    @Test
    fun `unknown teacher employee number produces TEACHER_NOT_FOUND error`() {
        val row = validRow(teacherEmployeeNumber = "EMP-99999")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.TEACHER_NOT_FOUND }
        assertNotNull(error)
        assertEquals("EMP-99999", error?.invalidValue)
    }

    @Test
    fun `year-month enrollment date is accepted and defaults to first day`() {
        val row = validRow(enrollmentDate = "2026-09")

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.READY, rows[0].status)
        assertEquals(1, rows[0].enrollmentDate?.dayOfMonth)
        assertEquals(9, rows[0].enrollmentDate?.monthValue)
        assertEquals(2026, rows[0].enrollmentDate?.year)
    }

    @Test
    fun `row number is correctly set based on file line position`() {
        val rows = validator.validateRows(
            listOf(validRow(studentNumber = "S001"), validRow(studentNumber = "S002")),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(2, rows[0].rowNumber) // header is row 1, first data row is row 2
        assertEquals(3, rows[1].rowNumber)
    }

    @Test
    fun `multiple errors on same row are all captured`() {
        val row = mapOf(
            "学号" to "S2026003",
            "姓名" to "测试",
            "专业" to "不存在的专业",
            "入学日期" to "2026-09-01",
            "身份证号" to "短号",
            "性别" to "",
            "民族" to "汉族",
            "联系电话" to "00000",
            "电子邮箱" to "",
            "班主任/辅导员工号" to ""
        )

        val rows = validator.validateRows(
            listOf(row),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )

        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        assertTrue(rows[0].errors.size >= 2, "Should have at least 2 errors (major + id card + phone)")
        val codes = rows[0].errors.map { it.code }
        assertTrue(codes.contains(StudentImportErrorCode.MAJOR_NOT_FOUND))
        assertTrue(codes.contains(StudentImportErrorCode.INVALID_ID_CARD_FORMAT))
        assertTrue(codes.contains(StudentImportErrorCode.INVALID_PHONE_FORMAT))
    }

    // --- Name Validation Tests ---

    @Test
    fun `valid standard Chinese names are classified as READY`() {
        for (name in listOf("张三", "李雷", "诸葛孔明", "欧阳修远")) {
            val rows = validator.validateRows(
                listOf(validRow(name = name)),
                majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
            )
            assertEquals(StudentImportStatus.READY, rows[0].status, "Name '$name' should be valid")
            assertEquals(name, rows[0].name)
        }
    }

    @Test
    fun `valid minority names with middle dot are accepted`() {
        for (name in listOf("买买提·吐尔逊", "阿依努尔•阿卜杜拉")) {
            val rows = validator.validateRows(
                listOf(validRow(name = name)),
                majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
            )
            assertEquals(StudentImportStatus.READY, rows[0].status, "Minority name '$name' should be valid")
            assertEquals(name, rows[0].name)
        }
    }

    @Test
    fun `valid Latin names with spaces and hyphens are accepted`() {
        for (name in listOf("John Doe", "Jean-Luc", "Mary-Jane", "O'Connor")) {
            val rows = validator.validateRows(
                listOf(validRow(name = name)),
                majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
            )
            assertEquals(StudentImportStatus.READY, rows[0].status, "Latin name '$name' should be valid")
            assertEquals(name, rows[0].name)
        }
    }

    @Test
    fun `name with trailing or leading spaces is trimmed and accepted if valid`() {
        val rows = validator.validateRows(
            listOf(validRow(name = "  王小明  ")),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )
        assertEquals(StudentImportStatus.READY, rows[0].status)
        assertEquals("王小明", rows[0].name, "Name should be trimmed")
    }

    @Test
    fun `name with internal double spaces is rejected`() {
        val rows = validator.validateRows(
            listOf(validRow(name = "张  三")),
            majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
        )
        assertEquals(StudentImportStatus.INVALID, rows[0].status)
        val error = rows[0].errors.find { it.code == StudentImportErrorCode.INVALID_NAME_FORMAT }
        assertNotNull(error, "Double-spaced name should produce INVALID_NAME_FORMAT")
    }

    @Test
    fun `name with symbols or numbers produces INVALID_NAME_FORMAT error`() {
        for (name in listOf("张*三", "Alex#123", "李4", "王@五")) {
            val rows = validator.validateRows(
                listOf(validRow(name = name)),
                majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
            )
            assertEquals(StudentImportStatus.INVALID, rows[0].status, "Name '$name' should be invalid")
            val error = rows[0].errors.find { it.code == StudentImportErrorCode.INVALID_NAME_FORMAT }
            assertNotNull(error, "Name '$name' should produce INVALID_NAME_FORMAT")
        }
    }

    @Test
    fun `single character name produces INVALID_NAME_FORMAT error`() {
        for (name in listOf("张", "A")) {
            val rows = validator.validateRows(
                listOf(validRow(name = name)),
                majorsMap, ethnicitiesMap, teachersMap, existingStudentNums
            )
            assertEquals(StudentImportStatus.INVALID, rows[0].status, "Single-char name '$name' should be invalid")
            val error = rows[0].errors.find { it.code == StudentImportErrorCode.INVALID_NAME_FORMAT }
            assertNotNull(error, "Single-char name '$name' should produce INVALID_NAME_FORMAT")
        }
    }
}
