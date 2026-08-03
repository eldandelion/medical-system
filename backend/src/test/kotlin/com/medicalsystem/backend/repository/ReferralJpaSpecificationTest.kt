package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import jakarta.persistence.EntityManager
import java.time.LocalDate
import java.time.LocalDateTime

@SpringBootTest
@Transactional
class ReferralJpaSpecificationTest {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var referralJpaRepository: ReferralJpaRepository

    @Autowired
    private lateinit var referralRepositoryAdapter: ReferralRepositoryAdapter

    @Test
    fun `test ByAssignedDoctor specification and countActionableReferralsFor for Doctor`() {
        // Arrange
        val hospital = HospitalEntity(name = "Test Hospital")
        entityManager.persist(hospital)

        val dept = HospitalDepartmentEntity(name = "Psychiatry", hospital = hospital)
        entityManager.persist(dept)

        val docUser = UserEntity(name = "Doctor Li", email = EmailAddress("drli@test.com"), role = UserRole.DOCTOR)
        entityManager.persist(docUser)

        val otherDocUser = UserEntity(name = "Doctor Wang", email = EmailAddress("drwang@test.com"), role = UserRole.DOCTOR)
        entityManager.persist(otherDocUser)

        val doctor = DoctorEntity(userId = docUser.id!!, employeeNumber = "D-101", department = dept)
        entityManager.persist(doctor)

        val otherDoctor = DoctorEntity(userId = otherDocUser.id!!, employeeNumber = "D-102", department = dept)
        entityManager.persist(otherDoctor)

        val college = CollegeEntity(name = "CS")
        entityManager.persist(college)
        val major = MajorEntity(name = "Software", college = college)
        entityManager.persist(major)

        val studentUser = UserEntity(name = "Student 1", email = EmailAddress("s1@test.com"), role = UserRole.STUDENT)
        entityManager.persist(studentUser)

        val student = StudentEntity(id = studentUser.id!!, studentNumber = "S1001", name = "Student 1", major = major, enrollmentDate = LocalDate.now())
        entityManager.persist(student)

        val referrerUser = UserEntity(name = "Teacher A", email = EmailAddress("ta@test.com"), role = UserRole.TEACHER)
        entityManager.persist(referrerUser)

        // Referral 1: Assigned to doctor, WAITING_FOR_SCHEDULING (actionable for doctor)
        val ref1 = ReferralEntity(
            studentId = student.id,
            type = ReferralType.INITIAL,
            title = "Ref 1 - Needs Scheduling",
            description = "Desc",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_SCHEDULING,
            referredById = referrerUser.id!!,
            createdAt = LocalDateTime.now(),
            destination = ReferralDestinationEntity(hospital = hospital, department = dept, doctor = doctor)
        )
        entityManager.persist(ref1)

        // Referral 2: Assigned to doctor, WAITING_FOR_APPOINTMENT (actionable for doctor)
        val ref2 = ReferralEntity(
            studentId = student.id,
            type = ReferralType.INITIAL,
            title = "Ref 2 - Needs Feedback",
            description = "Desc",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = referrerUser.id!!,
            createdAt = LocalDateTime.now(),
            destination = ReferralDestinationEntity(hospital = hospital, department = dept, doctor = doctor)
        )
        entityManager.persist(ref2)

        // Referral 3: Assigned to OTHER doctor, WAITING_FOR_APPOINTMENT (should NOT count for Doctor Li)
        val ref3 = ReferralEntity(
            studentId = student.id,
            type = ReferralType.INITIAL,
            title = "Ref 3 - Other Doctor",
            description = "Desc",
            riskLevel = RiskStatus.HIGH,
            status = ReferralStatus.WAITING_FOR_APPOINTMENT,
            referredById = referrerUser.id!!,
            createdAt = LocalDateTime.now(),
            destination = ReferralDestinationEntity(hospital = hospital, department = dept, doctor = otherDoctor)
        )
        entityManager.persist(ref3)

        // Referral 4: Assigned to doctor, but CLOSED (not actionable)
        val ref4 = ReferralEntity(
            studentId = student.id,
            type = ReferralType.INITIAL,
            title = "Ref 4 - Closed",
            description = "Desc",
            riskLevel = RiskStatus.LOW,
            status = ReferralStatus.CLOSED,
            referredById = referrerUser.id!!,
            createdAt = LocalDateTime.now(),
            destination = ReferralDestinationEntity(hospital = hospital, department = dept, doctor = doctor)
        )
        entityManager.persist(ref4)

        entityManager.flush()
        entityManager.clear()

        // Act & Assert 1: Visibility Specification ByAssignedDoctor
        val spec = ReferralJpaSpecification.fromVisibilityCriteria(VisibilityCriteria.ByAssignedDoctor(doctor.userId))
        val visibleReferrals = referralJpaRepository.findAll(spec)
        assertEquals(3, visibleReferrals.size) // ref1, ref2, ref4
        assertTrue(visibleReferrals.any { it.title == "Ref 1 - Needs Scheduling" })
        assertTrue(visibleReferrals.any { it.title == "Ref 2 - Needs Feedback" })
        assertTrue(visibleReferrals.any { it.title == "Ref 4 - Closed" })

        // Act & Assert 2: countActionableReferralsFor
        val doctorDomainUser = User(id = doctor.userId, name = docUser.name, email = docUser.email, role = UserRole.DOCTOR)
        val actionableCount = referralRepositoryAdapter.countActionableReferralsFor(doctorDomainUser)
        assertEquals(2L, actionableCount, "Doctor should have exactly 2 actionable referrals (WAITING_FOR_SCHEDULING and WAITING_FOR_APPOINTMENT)")
    }
}
