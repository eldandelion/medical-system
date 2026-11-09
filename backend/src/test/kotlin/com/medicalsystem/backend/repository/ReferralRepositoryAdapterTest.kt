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
import java.time.LocalDateTime

@SpringBootTest
@Transactional
class ReferralRepositoryAdapterTest {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var referralRepositoryAdapter: ReferralRepositoryAdapter

    @Test
    fun `test findStudentIdsWithOpenReferral returns only students with non-terminal referrals`() {
        // Empty check
        val emptyResult = referralRepositoryAdapter.findStudentIdsWithOpenReferral(emptyList())
        assertTrue(emptyResult.isEmpty())

        val initiator = UserEntity(name = "Initiator", email = EmailAddress("init@test.com"), role = UserRole.TEACHER)
        entityManager.persist(initiator)

        fun createReferral(studentId: Long, status: ReferralStatus): ReferralEntity {
            val entity = ReferralEntity(
                studentId = studentId,
                type = ReferralType.INITIAL,
                title = "Test Referral",
                description = "Description",
                riskLevel = RiskStatus.HIGH,
                status = status,
                referredById = initiator.id!!,
                createdAt = LocalDateTime.now()
            )
            entityManager.persist(entity)
            return entity
        }

        // Student 101: DRAFT (open)
        createReferral(101L, ReferralStatus.DRAFT)

        // Student 102: AWAITING_APPROVAL (open)
        createReferral(102L, ReferralStatus.AWAITING_APPROVAL)

        // Student 103: RECALLED (open)
        createReferral(103L, ReferralStatus.RECALLED)

        // Student 104: REJECTED and CLOSED (both terminal)
        createReferral(104L, ReferralStatus.REJECTED)
        createReferral(104L, ReferralStatus.CLOSED)

        // Student 105: No referrals

        entityManager.flush()

        val result = referralRepositoryAdapter.findStudentIdsWithOpenReferral(
            listOf(101L, 102L, 103L, 104L, 105L)
        )

        assertEquals(setOf(101L, 102L, 103L), result)
    }
}
