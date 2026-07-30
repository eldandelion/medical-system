package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.MajorEntity
import com.medicalsystem.backend.model.StudentVisibilityCriteria
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import jakarta.persistence.EntityManager
import java.time.LocalDate

@SpringBootTest
@Transactional
class StudentJpaSpecificationTest {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var studentJpaRepository: StudentJpaRepository

    @Test
    fun `test visibility specifications`() {
        // Setup mock data
        val college = CollegeEntity(name = "Engineering")
        entityManager.persist(college)

        val major = MajorEntity(name = "Computer Science", college = college)
        entityManager.persist(major)

        val userTeacher1 = com.medicalsystem.backend.entity.UserEntity(
            name = "Teacher 1",
            email = com.medicalsystem.backend.model.EmailAddress("t1@test.com"),
            role = com.medicalsystem.backend.model.UserRole.TEACHER
        )
        entityManager.persist(userTeacher1)

        val teacher1 = TeacherEntity(
            userId = userTeacher1.id!!,
            employeeNumber = "EMP1",
            college = college
        )
        entityManager.persist(teacher1)

        val student2 = StudentEntity(
            id = 1002L,
            studentNumber = "S456",
            name = "Another Student",
            major = major,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = null
        )
        entityManager.persist(student2)

        val student1 = StudentEntity(
            id = 1001L,
            studentNumber = "S123",
            name = "Test Student",
            major = major,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = teacher1
        )
        entityManager.persist(student1)

        entityManager.flush()
        entityManager.clear()

        // Test All criteria
        val allSpec = StudentJpaSpecification.fromVisibilityCriteria(StudentVisibilityCriteria.All)
        val allStudents = studentJpaRepository.findAll(allSpec)
        org.junit.jupiter.api.Assertions.assertTrue(allStudents.size >= 2)
        org.junit.jupiter.api.Assertions.assertTrue(allStudents.any { it.id == student1.id })
        org.junit.jupiter.api.Assertions.assertTrue(allStudents.any { it.id == student2.id })

        // Test None criteria
        val noneSpec = StudentJpaSpecification.fromVisibilityCriteria(StudentVisibilityCriteria.None)
        val noneStudents = studentJpaRepository.findAll(noneSpec)
        assertEquals(0, noneStudents.size)

        // Test Self criteria
        val selfSpec = StudentJpaSpecification.fromVisibilityCriteria(StudentVisibilityCriteria.Self(student1.id))
        val selfStudents = studentJpaRepository.findAll(selfSpec)
        assertEquals(1, selfStudents.size)
        assertEquals(student1.id, selfStudents[0].id)

        // Test ByAssignedTeacher criteria
        val teacherSpec = StudentJpaSpecification.fromVisibilityCriteria(StudentVisibilityCriteria.ByAssignedTeacher(teacher1.userId))
        val teacherStudents = studentJpaRepository.findAll(teacherSpec)
        assertEquals(1, teacherStudents.size)
        assertEquals(student1.id, teacherStudents[0].id)
    }
}
