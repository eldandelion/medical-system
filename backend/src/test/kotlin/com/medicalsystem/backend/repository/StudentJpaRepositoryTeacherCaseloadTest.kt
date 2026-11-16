package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.UserRole
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@SpringBootTest
@Transactional
class StudentJpaRepositoryTeacherCaseloadTest {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var studentJpaRepository: StudentJpaRepository

    @Test
    fun `countAssignedStudentsGroupedByTeacher and findByAssignedTeacherUserId return accurate caseload`() {
        val college = CollegeEntity(name = "Caseload Test College")
        entityManager.persist(college)

        val major = MajorEntity(name = "Caseload Test Major", college = college)
        entityManager.persist(major)

        val ethnicity = EthnicityEntity(name = "Caseload Test Ethnicity")
        entityManager.persist(ethnicity)

        val teacherUser1 = UserEntity(
            name = "Caseload Teacher 1",
            email = EmailAddress("caseload-t1@test.com"),
            role = UserRole.TEACHER
        )
        entityManager.persist(teacherUser1)
        val teacher1 = TeacherEntity(userId = teacherUser1.id, employeeNumber = "EMP-CL-1", college = college)
        entityManager.persist(teacher1)

        val teacherUser2 = UserEntity(
            name = "Caseload Teacher 2",
            email = EmailAddress("caseload-t2@test.com"),
            role = UserRole.TEACHER
        )
        entityManager.persist(teacherUser2)
        val teacher2 = TeacherEntity(userId = teacherUser2.id, employeeNumber = "EMP-CL-2", college = college)
        entityManager.persist(teacher2)

        val s1 = StudentEntity(
            id = 9101L,
            studentNumber = "CL-2026-001",
            name = "Assigned One",
            major = major,
            enrollmentDate = LocalDate.of(2026, 9, 1),
            demographics = StudentDemographicsEntity(ethnicity = ethnicity),
            assignedTeacher = teacher1
        )
        val s2 = StudentEntity(
            id = 9102L,
            studentNumber = "CL-2026-002",
            name = "Assigned Two",
            major = major,
            enrollmentDate = LocalDate.of(2026, 9, 1),
            assignedTeacher = teacher1
        )
        val s3 = StudentEntity(
            id = 9103L,
            studentNumber = "CL-2026-003",
            name = "Unassigned Three",
            major = major,
            enrollmentDate = LocalDate.of(2026, 9, 1),
            assignedTeacher = null
        )
        entityManager.persist(s1)
        entityManager.persist(s2)
        entityManager.persist(s3)

        entityManager.flush()
        entityManager.clear()

        val counts = studentJpaRepository.countAssignedStudentsGroupedByTeacher()
            .associate { it.getTeacherId() to it.getStudentCount() }

        assertEquals(2L, counts[teacher1.userId])
        assertTrue(!counts.containsKey(teacher2.userId))

        val caseload = studentJpaRepository.findByAssignedTeacherUserId(teacher1.userId)
        assertEquals(2, caseload.size)
        assertEquals(setOf("CL-2026-001", "CL-2026-002"), caseload.map { it.studentNumber }.toSet())
        // Verify @EntityGraph initialized major, ethnicity, and assignedTeacher after clear()
        val first = caseload.first { it.studentNumber == "CL-2026-001" }
        assertEquals("Caseload Test Major", first.major.name)
        assertEquals("Caseload Test Ethnicity", first.demographics?.ethnicity?.name)
        assertEquals(teacher1.userId, first.assignedTeacher?.userId)
    }
}
