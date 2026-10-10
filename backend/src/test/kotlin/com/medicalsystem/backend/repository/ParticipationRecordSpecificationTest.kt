package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentAssignmentEntity
import com.medicalsystem.backend.entity.AssessmentDispatchEntity
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import jakarta.persistence.EntityManager
import java.time.LocalDate

@SpringBootTest
@Transactional
class ParticipationRecordSpecificationTest {

    @Autowired
    private lateinit var assignmentRepository: AssessmentAssignmentJpaRepository
    
    @Autowired
    private lateinit var dispatchRepository: AssessmentDispatchJpaRepository
    
    @Autowired
    private lateinit var entityManager: EntityManager

    @Test
    fun `should filter by dispatchId and severity`() {
        val adminUser = UserEntity(name = "admin", email = EmailAddress("admin@test.com"), role = UserRole.TRIAL_ADMIN)
        entityManager.persist(adminUser)
        
        val dispatch1 = AssessmentDispatchEntity(batteryCode = "PHQ-9", dispatchedByUser = adminUser)
        entityManager.persist(dispatch1)
        val dispatch2 = AssessmentDispatchEntity(batteryCode = "GAD-7", dispatchedByUser = adminUser)
        entityManager.persist(dispatch2)
        
        val college = CollegeEntity(name = "CS")
        entityManager.persist(college)
        val major = MajorEntity(name = "Software", college = college)
        entityManager.persist(major)

        val studentUser = UserEntity(name = "s1", email = EmailAddress("s1@test.com"), role = UserRole.STUDENT)
        entityManager.persist(studentUser)
        
        val student1 = StudentEntity(id = studentUser.id!!, studentNumber = "S001", name = "Alice", major = major, enrollmentDate = LocalDate.now())
        entityManager.persist(student1)
        
        val a1 = AssessmentAssignmentEntity(student = student1, assignedByUser = adminUser, batteryCode = "PHQ-9", dispatch = dispatch1, severity = ResultSeverity.HIGH)
        val a2 = AssessmentAssignmentEntity(student = student1, assignedByUser = adminUser, batteryCode = "GAD-7", dispatch = dispatch2, severity = ResultSeverity.HIGH)
        val a3 = AssessmentAssignmentEntity(student = student1, assignedByUser = adminUser, batteryCode = "PHQ-9", dispatch = dispatch1, severity = ResultSeverity.LOW)
        
        assignmentRepository.save(a1)
        assignmentRepository.save(a2)
        assignmentRepository.save(a3)
        
        entityManager.flush()
        
        val spec = ParticipationRecordSpecification.withFilters(dispatch1.id, null, null, ResultSeverity.HIGH)
        val results = assignmentRepository.findAll(spec)
        
        assertEquals(1, results.size)
        assertEquals(dispatch1.id, results[0].dispatch?.id)
        assertEquals(ResultSeverity.HIGH, results[0].severity)
    }
}
