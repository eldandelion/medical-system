package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.RiskStatus
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import org.slf4j.LoggerFactory
import org.springframework.context.event.EventListener
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Component

import org.springframework.transaction.annotation.Transactional

@Component
@Transactional
class StudentHealthProfileRiskListener(
    private val healthProfileRepository: StudentHealthProfileRepository,
    private val referralRepository: com.medicalsystem.backend.repository.ReferralRepository
) {
    private val logger = LoggerFactory.getLogger(StudentHealthProfileRiskListener::class.java)

    @Async
    @EventListener
    fun onReferralInitiated(event: ReferralInitiatedEvent) {
        val referral = referralRepository.findById(event.referralId).orElse(null) ?: return
        logger.info("Handling ReferralInitiatedEvent for student ${event.studentId} with risk status ${referral.riskLevel}")
        updateRiskLevelIfHigher(event.studentId, referral.riskLevel.name)
    }
    
    @Async
    @EventListener
    fun onStudentRegistered(event: StudentRegisteredEvent) {
        logger.info("Handling StudentRegisteredEvent for student ${event.studentId} with risk level ${event.riskLevel}")
        // Registration already creates initial profile, but if it didn't, we'd do it here.
    }

    private fun updateRiskLevelIfHigher(studentId: Long, newRiskLevel: String) {
        val profile = healthProfileRepository.findByStudentId(studentId).orElse(null)
        if (profile != null) {
            try {
                val newStatus = RiskStatus.valueOf(newRiskLevel.uppercase())
                if (newStatus.ordinal > profile.riskStatus.ordinal) {
                    profile.riskStatus = newStatus
                    healthProfileRepository.save(profile)
                    logger.info("Updated risk status for student $studentId to $newStatus")
                }
            } catch (e: Exception) {
                logger.warn("Failed to parse risk level $newRiskLevel", e)
            }
        }
    }
}
