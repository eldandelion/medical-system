package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AppointmentEntity
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.model.AppointmentStatus
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.model.ReferralType
import com.medicalsystem.backend.model.RiskStatus
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import jakarta.persistence.EntityManager
import java.time.LocalDateTime

@SpringBootTest
@Transactional
class AppointmentEntityMappingTest {

    @Autowired
    lateinit var entityManager: EntityManager

    @Test
    fun `should save and retrieve AppointmentEntity mapped to ReferralEntity`() {
        val referral = ReferralEntity(
            studentId = 1L,
            type = ReferralType.INITIAL,
            title = "Test Referral",
            description = "Test description",
            riskLevel = RiskStatus.LOW,
            status = ReferralStatus.WAITING_FOR_SCHEDULING,
            referredById = 2L
        )
        entityManager.persist(referral)

        val appointment = AppointmentEntity(
            referral = referral,
            doctorId = 3L,
            appointmentTime = java.time.Instant.now().plusSeconds(86400),
            status = AppointmentStatus.SCHEDULED
        )
        referral.appointment = appointment
        entityManager.persist(appointment)
        entityManager.flush()
        entityManager.clear()

        val foundReferral = entityManager.find(ReferralEntity::class.java, referral.id)
        assertNotNull(foundReferral?.appointment)
        assertEquals(3L, foundReferral?.appointment?.doctorId)
        assertEquals(AppointmentStatus.SCHEDULED, foundReferral?.appointment?.status)
    }
}
