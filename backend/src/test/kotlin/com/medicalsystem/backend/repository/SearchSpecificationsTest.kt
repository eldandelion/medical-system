package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

@SpringBootTest
@Transactional
class SearchSpecificationsTest {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Autowired
    private lateinit var referralJpaRepository: ReferralJpaRepository

    @Test
    fun `studentSearch combines visibility criteria and keyword queries`() {
        val college = CollegeEntity(name = "信息学院")
        entityManager.persist(college)

        val majorCs = MajorEntity(name = "计算机科学与技术", college = college)
        entityManager.persist(majorCs)

        val majorAi = MajorEntity(name = "人工智能", college = college)
        entityManager.persist(majorAi)

        val userTeacher1 = UserEntity(
            name = "Teacher Li",
            email = EmailAddress("tli@csu.edu.cn"),
            role = UserRole.TEACHER
        )
        entityManager.persist(userTeacher1)

        val teacher1 = TeacherEntity(
            userId = userTeacher1.id!!,
            employeeNumber = "EMP-T1",
            college = college
        )
        entityManager.persist(teacher1)

        val student1 = StudentEntity(
            id = 2001L,
            studentNumber = "2026001",
            name = "张三丰",
            major = majorCs,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = teacher1
        )
        entityManager.persist(student1)

        val student2 = StudentEntity(
            id = 2002L,
            studentNumber = "2026002",
            name = "张无忌",
            major = majorAi,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = null
        )
        entityManager.persist(student2)

        val student3 = StudentEntity(
            id = 2003L,
            studentNumber = "2026003",
            name = "李逍遥",
            major = majorCs,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = null
        )
        entityManager.persist(student3)

        entityManager.flush()
        entityManager.clear()

        // 1. All criteria with name search: "张" should match student1 and student2
        val allNameSpec = SearchSpecifications.studentSearch(StudentVisibilityCriteria.All, "张")
        val allNameResults = studentJpaRepository.findAll(allNameSpec)
        assertTrue(allNameResults.any { it.id == student1.id })
        assertTrue(allNameResults.any { it.id == student2.id })
        assertFalse(allNameResults.any { it.id == student3.id })

        // 2. Teacher criteria with name search: "张" should only match student1 (assigned to Teacher 1)
        val teacherNameSpec = SearchSpecifications.studentSearch(
            StudentVisibilityCriteria.ByAssignedTeacher(teacher1.userId),
            "张"
        )
        val teacherNameResults = studentJpaRepository.findAll(teacherNameSpec)
        assertEquals(1, teacherNameResults.size)
        assertEquals(student1.id, teacherNameResults[0].id)

        // 3. Search by student number
        val numberSpec = SearchSpecifications.studentSearch(StudentVisibilityCriteria.All, "2026002")
        val numberResults = studentJpaRepository.findAll(numberSpec)
        assertEquals(1, numberResults.size)
        assertEquals(student2.id, numberResults[0].id)

        // 4. Search by major name
        val majorSpec = SearchSpecifications.studentSearch(StudentVisibilityCriteria.All, "人工")
        val majorResults = studentJpaRepository.findAll(majorSpec)
        assertEquals(1, majorResults.size)
        assertEquals(student2.id, majorResults[0].id)
    }

    @Test
    fun `referralSearch combines visibility criteria and keyword queries`() {
        val college = CollegeEntity(name = "软件学院")
        entityManager.persist(college)

        val major = MajorEntity(name = "软件工程", college = college)
        entityManager.persist(major)

        val student = StudentEntity(
            id = 3001L,
            studentNumber = "2026301",
            name = "王小明",
            major = major,
            enrollmentDate = LocalDate.now()
        )
        entityManager.persist(student)

        val referral1 = ReferralEntity(
            studentId = student.id,
            type = ReferralType.INITIAL,
            title = "重度抑郁倾向危机就诊",
            description = "多日失眠且厌学",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = 100L,
            createdAt = LocalDateTime.now()
        )
        entityManager.persist(referral1)

        val referral2 = ReferralEntity(
            studentId = student.id,
            type = ReferralType.FOLLOW_UP,
            title = "日常情绪复查",
            description = "情绪状态平稳",
            riskLevel = RiskStatus.LOW,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = 100L,
            createdAt = LocalDateTime.now()
        )
        entityManager.persist(referral2)

        entityManager.flush()
        entityManager.clear()

        // 1. Search by title keyword
        val titleSpec = SearchSpecifications.referralSearch(VisibilityCriteria.All, "抑郁")
        val titleResults = referralJpaRepository.findAll(titleSpec)
        assertEquals(1, titleResults.size)
        assertEquals(referral1.title, titleResults[0].title)

        // 2. Search by description keyword
        val descSpec = SearchSpecifications.referralSearch(VisibilityCriteria.All, "失眠")
        val descResults = referralJpaRepository.findAll(descSpec)
        assertEquals(1, descResults.size)
        assertEquals(referral1.title, descResults[0].title)

        // 3. Search by student name subquery
        val studentNameSpec = SearchSpecifications.referralSearch(VisibilityCriteria.All, "小明")
        val studentNameResults = referralJpaRepository.findAll(studentNameSpec)
        assertEquals(2, studentNameResults.size)

        // 4. Search by student number subquery
        val studentNumberSpec = SearchSpecifications.referralSearch(VisibilityCriteria.All, "2026301")
        val studentNumberResults = referralJpaRepository.findAll(studentNumberSpec)
        assertEquals(2, studentNumberResults.size)

        // 5. Visibility filtering with non-matching initiator
        val noneSpec = SearchSpecifications.referralSearch(VisibilityCriteria.ByInitiator(99999L), "小明")
        val noneResults = referralJpaRepository.findAll(noneSpec)
        assertEquals(0, noneResults.size)
    }
}
