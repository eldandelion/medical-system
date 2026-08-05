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
class AssessmentRepositoryAdapterTest {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var assignmentRepository: AssessmentAssignmentRepository

    @Test
    fun `test save and find assignments by student and status`() {
        val college = CollegeEntity(name = "School of Science")
        entityManager.persist(college)

        val major = MajorEntity(name = "Psychology", college = college)
        entityManager.persist(major)

        val teacherUser = UserEntity(
            name = "Counselor Wang",
            email = EmailAddress("counselor.wang@univ.edu"),
            role = UserRole.TEACHER
        )
        entityManager.persist(teacherUser)

        val studentUser = UserEntity(
            name = "Student Xiao",
            email = EmailAddress("student.xiao@univ.edu"),
            role = UserRole.STUDENT
        )
        entityManager.persist(studentUser)

        val studentEntity = StudentEntity(
            id = studentUser.id,
            studentNumber = "STU20239999",
            name = "Student Xiao",
            major = major,
            enrollmentDate = LocalDate.of(2023, 9, 1)
        )
        entityManager.persist(studentEntity)
        entityManager.flush()

        val assignment = AssessmentAssignment(
            studentId = studentEntity.id,
            assignedByUserId = teacherUser.id,
            batteryCode = BatteryId("MENTAL_HEALTH_ASSESSMENT"),
            status = AssessmentStatus.PENDING,
            assignedAt = LocalDateTime.now(),
            dueDate = LocalDate.now().plusDays(7)
        )

        val saved = assignmentRepository.save(assignment)
        assertNotNull(saved.id)

        val foundList = assignmentRepository.findByStudentId(studentEntity.id)
        assertEquals(1, foundList.size)
        assertEquals(BatteryId("MENTAL_HEALTH_ASSESSMENT"), foundList[0].batteryCode)
        assertEquals(AssessmentStatus.PENDING, foundList[0].status)

        val pendingOpt = assignmentRepository.findPendingByStudentIdAndBatteryCode(studentEntity.id, "MENTAL_HEALTH_ASSESSMENT")
        assertTrue(pendingOpt.isPresent)
    }
}
