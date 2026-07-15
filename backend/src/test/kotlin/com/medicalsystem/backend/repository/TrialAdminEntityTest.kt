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

        val trialAdmin = TrialAdminEntity(
            name = "Test Admin",
            email = "admin@test.com",
            hospital = hospital
        )
        entityManager.persist(trialAdmin)
        entityManager.flush()
        entityManager.clear()

        val foundAdmin = entityManager.find(TrialAdminEntity::class.java, trialAdmin.id)
        assertNotNull(foundAdmin)
        assertNotNull(foundAdmin.hospital)
        assertNotNull(foundAdmin.hospital?.id)
    }

    @Test
    fun `should enforce one-to-one constraint between TrialAdmin and Hospital`() {
        val hospital = HospitalEntity(name = "Test Hospital 2")
        entityManager.persist(hospital)

        val trialAdmin1 = TrialAdminEntity(
            name = "Test Admin 1",
            email = "admin1@test.com",
            hospital = hospital
        )
        entityManager.persist(trialAdmin1)
        entityManager.flush()

        val trialAdmin2 = TrialAdminEntity(
            name = "Test Admin 2",
            email = "admin2@test.com",
            hospital = hospital
        )
        
        assertThrows<jakarta.persistence.PersistenceException> {
            entityManager.persist(trialAdmin2)
            entityManager.flush()
        }
    }
}
