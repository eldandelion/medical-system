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

    @Test
    fun `test findVisibleStudentsFor and findByIdAndVisibleTo for doctor and trial admin`() {
        val college = CollegeEntity(name = "Engineering")
        entityManager.persist(college)

        val major = MajorEntity(name = "Computer Science", college = college)
        entityManager.persist(major)

        val docUser = UserEntity(name = "Dr. House", email = EmailAddress("doc@test.com"), role = UserRole.DOCTOR)
        entityManager.persist(docUser)

        val hospital = HospitalEntity(name = "General Hospital")
        entityManager.persist(hospital)

        val dept = HospitalDepartmentEntity(name = "Psychiatry", hospital = hospital)
        entityManager.persist(dept)

        val doctor = DoctorEntity(userId = docUser.id!!, employeeNumber = "DOC100", department = dept)
        entityManager.persist(doctor)

        val adminUser = UserEntity(name = "Admin Smith", email = EmailAddress("admin@test.com"), role = UserRole.TRIAL_ADMIN)
        entityManager.persist(adminUser)

        val student1 = StudentEntity(id = 2001L, studentNumber = "STU2001", name = "Charlie", major = major, enrollmentDate = LocalDate.now())
        entityManager.persist(student1)

        val student2 = StudentEntity(id = 2002L, studentNumber = "STU2002", name = "Diana", major = major, enrollmentDate = LocalDate.now())
        entityManager.persist(student2)

        val referral = ReferralEntity(
            studentId = student1.id,
            type = com.medicalsystem.backend.model.ReferralType.INITIAL,
            title = "Severe anxiety",
            description = "Requires psychiatric evaluation",
            riskLevel = com.medicalsystem.backend.model.RiskStatus.HIGH,
            status = com.medicalsystem.backend.model.ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = 1L
        )
        referral.destination = ReferralDestinationEntity(
            hospital = hospital,
            department = dept,
            doctor = doctor
        )
        referral.steps.add(ReferralStepEntity(
            referral = referral,
            type = com.medicalsystem.backend.model.ReferralStepType.TRIAGE,
            time = java.time.LocalDateTime.now(),
            status = com.medicalsystem.backend.model.ReferralStepStatus.COMPLETED
        ))
        entityManager.persist(referral)

        entityManager.flush()
        entityManager.clear()

        val doctorModel = com.medicalsystem.backend.model.User(
            id = docUser.id!!,
            name = docUser.name,
            email = docUser.email,
            role = docUser.role
        )
        val adminModel = com.medicalsystem.backend.model.User(
            id = adminUser.id!!,
            name = adminUser.name,
            email = adminUser.email,
            role = adminUser.role
        )

        // Doctor should see student1 (assigned to them via referral) but not student2
        val docVisible = studentRepository.findVisibleStudentsFor(doctorModel)
        org.junit.jupiter.api.Assertions.assertTrue(docVisible.any { it.id == student1.id })
        org.junit.jupiter.api.Assertions.assertFalse(docVisible.any { it.id == student2.id })

        val docFound = studentRepository.findByIdAndVisibleTo(student1.id, doctorModel)
        assertEquals(true, docFound.isPresent)
        assertEquals(false, studentRepository.findByIdAndVisibleTo(student2.id, doctorModel).isPresent)

        // Trial Admin should see student1 (referral reached TRIAGE step) but not student2
        val adminVisible = studentRepository.findVisibleStudentsFor(adminModel)
        org.junit.jupiter.api.Assertions.assertTrue(adminVisible.any { it.id == student1.id })
        org.junit.jupiter.api.Assertions.assertFalse(adminVisible.any { it.id == student2.id })

        val adminFound = studentRepository.findByIdAndVisibleTo(student1.id, adminModel)
        assertEquals(true, adminFound.isPresent)
        assertEquals(false, studentRepository.findByIdAndVisibleTo(student2.id, adminModel).isPresent)
    }
}
