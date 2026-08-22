package com.medicalsystem.backend.integration

import com.medicalsystem.backend.dto.UpdateUserProfileRequest
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.EthnicityJpaRepository
import com.medicalsystem.backend.service.UserProfileService
import jakarta.persistence.EntityManager
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@SpringBootTest
@Transactional
class UserProfileIntegrationTest {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var ethnicityJpaRepository: EthnicityJpaRepository

    @Autowired
    private lateinit var userProfileService: UserProfileService

    @Test
    fun `getProfile and updateProfile against database entities`() {
        val school = SchoolEntity(name = "Test Zhongnan University")
        entityManager.persist(school)

        val college = CollegeEntity(name = "Test School of Computer Science")
        entityManager.persist(college)

        val major = MajorEntity(name = "Test Software Engineering", college = college)
        entityManager.persist(major)

        val ethnicity = ethnicityJpaRepository.findByName("汉族").orElseGet {
            val eth = EthnicityEntity(name = "测试民族")
            entityManager.persist(eth)
            eth
        }

        val userEntity = UserEntity(
            name = "Test Student",
            email = EmailAddress("student.test@univ.edu.cn"),
            role = UserRole.STUDENT
        )
        entityManager.persist(userEntity)
        entityManager.flush()

        val studentEntity = StudentEntity(
            id = userEntity.id,
            studentNumber = "STU-99001",
            name = "Test Student",
            major = major,
            enrollmentDate = LocalDate.of(2023, 9, 1),
            demographics = StudentDemographicsEntity(
                gender = Gender.MALE,
                dateOfBirth = LocalDate.of(2003, 3, 15),
                ethnicity = ethnicity,
                school = school,
                contactNumber = "13800001111"
            )
        )
        entityManager.persist(studentEntity)
        entityManager.flush()

        val domainUser = User(
            id = userEntity.id,
            name = "Test Student",
            email = EmailAddress("student.test@univ.edu.cn"),
            role = UserRole.STUDENT
        )

        // 1. Test getProfile
        val profile = userProfileService.getProfile(domainUser)
        assertEquals("Test Student", profile.name)
        assertEquals("STU-99001", profile.studentProfile?.studentNumber)
        assertEquals("Test Software Engineering", profile.studentProfile?.major)
        assertEquals(Gender.MALE, profile.studentProfile?.gender)
        assertEquals("13800001111", profile.studentProfile?.contactNumber)

        // 2. Test updateProfile
        val updateReq = UpdateUserProfileRequest(
            name = "Test Student Renamed",
            contactNumber = "13988887777",
            homeAddress = "Haidian District, Beijing",
            emergencyContactName = "Emergency Parent",
            emergencyContactPhone = "13912345678"
        )
        val updated = userProfileService.updateProfile(domainUser, updateReq)

        assertEquals("Test Student Renamed", updated.name)
        assertEquals("13988887777", updated.studentProfile?.contactNumber)
        assertEquals("Haidian District, Beijing", updated.studentProfile?.homeAddress)
        assertEquals("Emergency Parent", updated.studentProfile?.emergencyContactName)
        assertEquals("13912345678", updated.studentProfile?.emergencyContactPhone)
    }
}
