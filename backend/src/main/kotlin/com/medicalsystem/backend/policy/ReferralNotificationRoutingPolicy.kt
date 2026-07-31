package com.medicalsystem.backend.policy

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.event.ReferralInitiatedEvent
import org.springframework.stereotype.Component

@Component
class ReferralNotificationRoutingPolicy(
    private val studentRepository: com.medicalsystem.backend.repository.StudentRepository,
    private val referralRepository: com.medicalsystem.backend.repository.ReferralRepository,
    private val userRepository: com.medicalsystem.backend.repository.UserRepository
) : NotificationRoutingPolicy<ReferralInitiatedEvent> {
    
    override fun determineNotifications(event: ReferralInitiatedEvent, contextId: Long?): List<Notification> {
        val student = studentRepository.findById(event.studentId).orElseThrow()
        val referral = referralRepository.findById(event.referralId).orElseThrow()
        val initiator = userRepository.findById(event.initiatorId).orElseThrow()
        
        val headCounsellorId = contextId
        val notifications = mutableListOf<Notification>()
        val riskName = referral.riskLevel.name

        // 1. Student always gets notified
        notifications.add(Notification.createForStudent(event.studentId, initiator.name))

        // 2. Head Counsellor Review Notification
        if (headCounsellorId != null) {
            notifications.add(Notification.createForHeadCounsellor(
                headCounsellorId, student.name, riskName, event.referralId
            ))
        }

        // 3. Initiator Notification (only if they are NOT the head counsellor)
        if (event.initiatorId != headCounsellorId) {
            notifications.add(Notification.createForInitiator(
                event.initiatorId, student.name, riskName, event.referralId
            ))
        }

        return notifications
    }
}
