package com.medicalsystem.backend.integration

import com.medicalsystem.backend.dto.StudentImportCommitRequestDto
import com.medicalsystem.backend.dto.StudentImportStatus
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.repository.StudentHealthProfileJpaRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.service.StudentImportService
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.mock.web.MockMultipartFile
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@SpringBootTest
@Transactional
class StudentImportIntegrationTest {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var studentImportService: StudentImportService

    @Autowired
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Autowired
    private lateinit var healthProfileJpaRepository: StudentHealthProfileJpaRepository

    @Autowired
    private lateinit var ethnicityJpaRepository: EthnicityJpaRepository

    @Autowired
    private lateinit var degreeLevelJpaRepository: com.medicalsystem.backend.repository.DegreeLevelJpaRepository

    private lateinit var major: MajorEntity
    private lateinit var ethnicity: EthnicityEntity
    private lateinit var teacher: TeacherEntity
    private val adminUser = User(
        id = 999L,
        name = "Super Admin",
        email = EmailAddress("admin.it@univ.edu.cn"),
        role = UserRole.SYSTEM_ADMIN
    )

    @BeforeEach
    fun setUp() {
        val college = CollegeEntity(name = "信息学院 (Test)")
        entityManager.persist(college)

        major = MajorEntity(name = "计算机科学与技术 (Test)", college = college)
        entityManager.persist(major)

        ethnicity = ethnicityJpaRepository.findByName("汉族").orElseGet {
            val eth = EthnicityEntity(name = "汉族")
            entityManager.persist(eth)
            eth
        }

        degreeLevelJpaRepository.findByName("BACHELOR").orElseGet {
            val deg = DegreeLevelEntity(name = "BACHELOR")
            entityManager.persist(deg)
            deg
        }

        val teacherUser = UserEntity(
            name = "王老师",
            email = EmailAddress("teacher.wang@univ.edu.cn"),
            role = UserRole.TEACHER
        )
        entityManager.persist(teacherUser)
        entityManager.flush()

        teacher = TeacherEntity(
            userId = teacherUser.id,
            employeeNumber = "EMP-TEST-001",
            college = college
        )
        entityManager.persist(teacher)
        entityManager.flush()
    }

    @Test
    fun `preview and commit full import flow against database`() {
        val csvContent = """
            学号,姓名,专业,入学日期,身份证号,性别,民族,联系电话,电子邮箱,家庭住址,紧急联系人,紧急联系电话,班主任/辅导员工号
            TEST-S01,张三,计算机科学与技术 (Test),2026-09-01,110101200801011230,男,汉族,13800138001,zhangsan@test.com,北京市海淀区,张父,13900139001,EMP-TEST-001
            TEST-S02,李四,计算机科学与技术 (Test),2026-09-01,11010120080202122X,女,汉族,13800138002,lisi@test.com,上海市浦东区,李母,13900139002,EMP-TEST-001
        """.trimIndent()

        val multipartFile = MockMultipartFile(
            "file",
            "students.csv",
            "text/csv",
            csvContent.toByteArray(Charsets.UTF_8)
        )

        // 1. Preview CSV
        val preview = studentImportService.previewCsv(multipartFile)
        assertEquals(2, preview.totalRows)
        assertEquals(2, preview.readyCount)
        assertEquals(0, preview.duplicateCount)
        assertEquals(0, preview.invalidCount)
        assertEquals("TEST-S01", preview.rows[0].studentNumber)
        assertEquals(StudentImportStatus.READY, preview.rows[0].status)

        // 2. Commit Import
        val commitReq = StudentImportCommitRequestDto(
            rows = preview.rows,
            overwriteDuplicates = false
        )
        val result = studentImportService.commitImport(commitReq, adminUser)

        assertEquals(2, result.totalProcessed)
        assertEquals(2, result.importedCount)
        assertEquals(0, result.updatedCount)
        assertEquals(0, result.skippedCount)
        assertTrue(result.failedRows.isEmpty())

        // 3. Verify Database Entities
        val s1 = studentJpaRepository.findByStudentNumber("TEST-S01")
        assertNotNull(s1)
        assertEquals("张三", s1?.name)
        assertEquals("计算机科学与技术 (Test)", s1?.major?.name)
        assertEquals("EMP-TEST-001", s1?.assignedTeacher?.employeeNumber)
        assertEquals("110101200801011230", s1?.demographics?.idCardNumber)
        assertEquals("zhangsan@test.com", s1?.demographics?.email)

        // Verify initial Health Profile created
        val profile1 = healthProfileJpaRepository.findByStudentId(s1!!.id)
        assertTrue(profile1.isPresent)
        assertEquals(com.medicalsystem.backend.model.RiskStatus.LOW, profile1.get().riskStatus)

        // 4. Test duplicate detection and update
        val updatedCsvContent = """
            学号,姓名,专业,入学日期,身份证号,性别,民族,联系电话,电子邮箱,家庭住址,紧急联系人,紧急联系电话,班主任/辅导员工号
            TEST-S01,张三丰,计算机科学与技术 (Test),2026-09-01,110101200801011230,男,汉族,13800138999,zhangsan.new@test.com,北京市朝阳区,张父,13900139001,EMP-TEST-001
        """.trimIndent()

        val updatedMultipartFile = MockMultipartFile(
            "file",
            "students_updated.csv",
            "text/csv",
            updatedCsvContent.toByteArray(Charsets.UTF_8)
        )

        val preview2 = studentImportService.previewCsv(updatedMultipartFile)
        assertEquals(1, preview2.totalRows)
        assertEquals(0, preview2.readyCount)
        assertEquals(1, preview2.duplicateCount)
        assertEquals(StudentImportStatus.DUPLICATE, preview2.rows[0].status)

        // Commit with overwriteDuplicates = true
        val updateCommitReq = StudentImportCommitRequestDto(
            rows = preview2.rows,
            overwriteDuplicates = true
        )
        val updateResult = studentImportService.commitImport(updateCommitReq, adminUser)

        assertEquals(1, updateResult.totalProcessed)
        assertEquals(0, updateResult.importedCount)
        assertEquals(1, updateResult.updatedCount)
        assertEquals(0, updateResult.skippedCount)

        // Verify updated entity
        val s1Updated = studentJpaRepository.findByStudentNumber("TEST-S01")
        assertNotNull(s1Updated)
        assertEquals("张三丰", s1Updated?.name)
        assertEquals("13800138999", s1Updated?.demographics?.contactNumber)
        assertEquals("zhangsan.new@test.com", s1Updated?.demographics?.email)
        assertEquals("北京市朝阳区", s1Updated?.demographics?.homeAddress)

        // Verify Health Profile is STILL intact
        val profile1StillThere = healthProfileJpaRepository.findByStudentId(s1Updated!!.id)
        assertTrue(profile1StillThere.isPresent)
    }
}
