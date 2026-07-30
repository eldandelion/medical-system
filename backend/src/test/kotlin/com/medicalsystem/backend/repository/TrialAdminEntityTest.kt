package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.HospitalEntity
import com.medicalsystem.backend.entity.TrialAdminEntity
import org.junit.jupiter.api.Assertions.assertNotNull
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.transaction.annotation.Transactional
import com.medicalsystem.backend.model.EmailAddress
import jakarta.persistence.EntityManager

@SpringBootTest
@Transactional
class TrialAdminEntityTest {

    @Autowired
    lateinit var entityManager: EntityManager

    @Test
    fun `should save and retrieve TrialAdminEntity with HospitalEntity`() {
        val hospital = HospitalEntity(name = "Test Hospital")
        entityManager.persist(hospital)

        val userEntity = com.medicalsystem.backend.entity.UserEntity(
            name = "Test Admin",
            email = com.medicalsystem.backend.model.EmailAddress("admin@test.com"),
            role = com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN
        )
        entityManager.persist(userEntity)

        val trialAdmin = TrialAdminEntity(
            userId = userEntity.id!!,
            employeeNumber = "HOSP-001",
            hospital = hospital
        )
        entityManager.persist(trialAdmin)
        entityManager.flush()
        entityManager.clear()

        val foundAdmin = entityManager.find(TrialAdminEntity::class.java, trialAdmin.userId)
        assertNotNull(foundAdmin)
        assertNotNull(foundAdmin.hospital)
        assertNotNull(foundAdmin.hospital.id)
    }

    @Test
    fun `should enforce one-to-one constraint between TrialAdmin and Hospital`() {
        val hospital = HospitalEntity(name = "Test Hospital 2")
        entityManager.persist(hospital)

        val userEntity1 = com.medicalsystem.backend.entity.UserEntity(
            name = "Test Admin 1",
            email = com.medicalsystem.backend.model.EmailAddress("admin1@test.com"),
            role = com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN
        )
        entityManager.persist(userEntity1)

        val trialAdmin1 = TrialAdminEntity(
            userId = userEntity1.id!!,
            employeeNumber = "HOSP-002",
            hospital = hospital
        )
        entityManager.persist(trialAdmin1)
        entityManager.flush()

        val userEntity2 = com.medicalsystem.backend.entity.UserEntity(
            name = "Test Admin 2",
            email = com.medicalsystem.backend.model.EmailAddress("admin2@test.com"),
            role = com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN
        )
        entityManager.persist(userEntity2)

        val trialAdmin2 = TrialAdminEntity(
            userId = userEntity2.id!!,
            employeeNumber = "HOSP-003",
            hospital = hospital
        )
        
        assertThrows<jakarta.persistence.PersistenceException> {
            entityManager.persist(trialAdmin2)
            entityManager.flush()
        }
    }
}
