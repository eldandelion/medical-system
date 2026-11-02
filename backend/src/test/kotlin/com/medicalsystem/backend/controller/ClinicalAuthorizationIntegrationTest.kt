package com.medicalsystem.backend.controller

import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.mapper.UserMapper
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional

@SpringBootTest(properties = ["SEED_DEMO_DATA=true", "spring.datasource.url=jdbc:h2:mem:clinical_scope_test;DB_CLOSE_DELAY=-1"])
@Transactional
class ClinicalAuthorizationIntegrationTest {
    @Autowired private lateinit var controller: StudentProfileController
    @Autowired private lateinit var referrals: ReferralJpaRepository
    @Autowired private lateinit var users: UserJpaRepository
    @Autowired private lateinit var profiles: StudentHealthProfileJpaRepository

    @Test
    fun `assigned doctor can update while unrelated doctor cannot alter same profile`() {
        val referral = referrals.findAll().first { it.destination?.doctor != null }
        val doctorId = referral.destination!!.doctor!!.userId
        val doctor = UserMapper().toModel(users.findById(doctorId).orElseThrow())
        val studentId = referral.studentId
        controller.updateHealthProfile(studentId, StudentProfileController.UpdateHealthProfileDto("synthetic authorized value"), doctor)
        profiles.flush()
        assertEquals("synthetic authorized value", profiles.findByStudentId(studentId).orElseThrow().scidDiagnosis)

        // A valid doctor role with no destination assignment must not inherit access.
        val unrelated = doctor.copy(id = Long.MAX_VALUE)
        assertThrows(ForbiddenException::class.java) {
            controller.updateHealthProfile(studentId, StudentProfileController.UpdateHealthProfileDto("unauthorized overwrite"), unrelated)
        }
        assertEquals("synthetic authorized value", profiles.findByStudentId(studentId).orElseThrow().scidDiagnosis)
    }
}
