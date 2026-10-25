package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ScaleDraftEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.UserRole
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@Transactional
class ScaleDraftJpaRepositoryTest {

    @Autowired
    private lateinit var draftRepository: ScaleDraftJpaRepository

    @Autowired
    private lateinit var userRepository: UserJpaRepository

    @Autowired
    private lateinit var entityManager: EntityManager

    @Test
    fun `testSaveAndRetrieveDraft saves draft and retrieves by studentId and scaleCode`() {
        val draft = ScaleDraftEntity(
            studentId = 9991L,
            scaleCode = "comprehensive_student_intake_survey",
            answersJson = """{"demo_name":"张三","phq9_1":2}""",
            clientUpdatedAt = 1700000000000L
        )
        val saved = draftRepository.save(draft)
        assertNotNull(saved.id)

        val retrievedOpt = draftRepository.findByStudentIdAndScaleCode(9991L, "comprehensive_student_intake_survey")
        assertTrue(retrievedOpt.isPresent)
        val retrieved = retrievedOpt.get()
        assertEquals(9991L, retrieved.studentId)
        assertEquals("comprehensive_student_intake_survey", retrieved.scaleCode)
        assertEquals("""{"demo_name":"张三","phq9_1":2}""", retrieved.answersJson)
        assertEquals(1700000000000L, retrieved.clientUpdatedAt)
    }

    @Test
    fun `testUniqueConstraint prevents duplicate drafts for same student and scale`() {
        val draft1 = ScaleDraftEntity(
            studentId = 9992L,
            scaleCode = "phq_9",
            answersJson = """{"phq9_1":1}""",
            clientUpdatedAt = 1700000001000L
        )
        draftRepository.save(draft1)
        entityManager.flush()

        val draft2 = ScaleDraftEntity(
            studentId = 9992L,
            scaleCode = "phq_9",
            answersJson = """{"phq9_1":2}""",
            clientUpdatedAt = 1700000002000L
        )

        assertThrows<DataIntegrityViolationException> {
            draftRepository.save(draft2)
            entityManager.flush()
        }
    }

    @Test
    fun `testDeleteDraft deletes draft cleanly`() {
        val draft = ScaleDraftEntity(
            studentId = 9993L,
            scaleCode = "gad_7",
            answersJson = """{"gad7_1":3}""",
            clientUpdatedAt = 1700000003000L
        )
        draftRepository.save(draft)
        entityManager.flush()

        assertTrue(draftRepository.existsByStudentIdAndScaleCode(9993L, "gad_7"))

        draftRepository.deleteByStudentIdAndScaleCode(9993L, "gad_7")
        entityManager.flush()

        assertFalse(draftRepository.existsByStudentIdAndScaleCode(9993L, "gad_7"))
    }

    @Test
    fun `testUserEntityFields persists phone and passwordHash and queries by phone`() {
        val user = UserEntity(
            name = "测试学生",
            email = EmailAddress("student_test_otp@csu.edu.cn"),
            role = UserRole.STUDENT,
            phone = "13877776666",
            passwordHash = "\$2a\$10\$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy"
        )
        val saved = userRepository.save(user)
        entityManager.flush()
        entityManager.clear()

        val byPhone = userRepository.findByPhone("13877776666")
        assertNotNull(byPhone)
        assertEquals(saved.id, byPhone?.id)
        assertEquals("13877776666", byPhone?.phone)
        assertNotNull(byPhone?.passwordHash)
        assertTrue(userRepository.existsByPhone("13877776666"))
        assertFalse(userRepository.existsByPhone("13999999999"))
    }

    @Test
    fun `testSaveAndRetrieveLongJsonDraft persists large 377 question JSON without truncation`() {
        val sb = StringBuilder("{")
        for (i in 1..400) {
            if (i > 1) sb.append(",")
            sb.append("\"question_key_$i\":\"")
            sb.append("详细补充说明与多选答案内容_".repeat(12))
            sb.append("\"")
        }
        sb.append("}")
        val longJson = sb.toString()
        assertTrue(longJson.length > 65535, "Expected payload > 64KB, got ${longJson.length}")

        val draft = ScaleDraftEntity(
            studentId = 9994L,
            scaleCode = "comprehensive_student_intake_survey",
            answersJson = longJson,
            clientUpdatedAt = 1700000004000L
        )
        draftRepository.save(draft)
        entityManager.flush()
        entityManager.clear()

        val retrieved = draftRepository.findByStudentIdAndScaleCode(9994L, "comprehensive_student_intake_survey")
        assertTrue(retrieved.isPresent)
        assertEquals(longJson.length, retrieved.get().answersJson.length)
        assertEquals(longJson, retrieved.get().answersJson)
    }
}
