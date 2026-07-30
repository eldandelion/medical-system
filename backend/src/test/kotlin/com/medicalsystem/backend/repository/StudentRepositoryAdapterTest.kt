package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.UserRole
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import jakarta.persistence.EntityManager
import java.time.LocalDate

@SpringBootTest
@Transactional
class StudentRepositoryAdapterTest {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var studentRepository: StudentRepository

    @Test
    fun `test findVisibleStudentsFor and findByIdAndVisibleTo`() {
        val college = CollegeEntity(name = "Engineering")
        entityManager.persist(college)

        val major = MajorEntity(name = "Computer Science", college = college)
        entityManager.persist(major)

        val userEntity = UserEntity(
            name = "Teacher 1",
            email = EmailAddress("teacher1@test.com"),
            role = UserRole.TEACHER
        )
        entityManager.persist(userEntity)

        val teacher1 = TeacherEntity(
            userId = userEntity.id!!,
            employeeNumber = "EMP1",
            college = college
        )
        entityManager.persist(teacher1)

        val studentEntity1 = StudentEntity(
            id = 1001L,
            studentNumber = "STU1",
            name = "Alice",
            major = major,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = teacher1
        )
        entityManager.persist(studentEntity1)

        val studentEntity2 = StudentEntity(
            id = 1002L,
            studentNumber = "STU2",
            name = "Bob",
            major = major,
            enrollmentDate = LocalDate.now(),
            assignedTeacher = null
        )
        entityManager.persist(studentEntity2)

        entityManager.flush()
        entityManager.clear()

        val teacherUser = com.medicalsystem.backend.model.User(
            id = userEntity.id!!,
            name = userEntity.name,
            email = userEntity.email,
            role = userEntity.role
        )

        // Test findVisibleStudentsFor
        val visibleStudents = studentRepository.findVisibleStudentsFor(teacherUser)
        assertEquals(1, visibleStudents.size)
        assertEquals(studentEntity1.id, visibleStudents[0].id)

        // Test findByIdAndVisibleTo for authorized student
        val foundStudent = studentRepository.findByIdAndVisibleTo(studentEntity1.id, teacherUser)
        assertEquals(true, foundStudent.isPresent)
        assertEquals(studentEntity1.id, foundStudent.get().id)

        // Test findByIdAndVisibleTo for unauthorized student
        val notFoundStudent = studentRepository.findByIdAndVisibleTo(studentEntity2.id, teacherUser)
        assertEquals(false, notFoundStudent.isPresent)
    }
}
