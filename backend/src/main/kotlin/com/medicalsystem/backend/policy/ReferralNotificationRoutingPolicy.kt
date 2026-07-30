package com.medicalsystem.backend.policy

import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.event.ReferralInitiatedEvent
import org.springframework.stereotype.Component

@Component
class ReferralNotificationRoutingPolicy : NotificationRoutingPolicy<ReferralInitiatedEvent> {
    
    override fun determineNotifications(event: ReferralInitiatedEvent, contextId: Long?): List<Notification> {
        val headCounsellorId = contextId
        val notifications = mutableListOf<Notification>()
        val riskName = event.riskStatus.name

        // 1. Student always gets notified
        notifications.add(Notification.createForStudent(event.studentId, riskName))

        if (headCounsellorId == null) {
            notifications.add(Notification.createForInitiator(event.initiatorId, event.studentId, riskName, event.referralId))
            return notifications
        }

        // 2. Deduplication and routing
        if (event.initiatorId == headCounsellorId) {
            notifications.add(Notification.createDeduplicatedForHcInitiator(
                headCounsellorId, event.studentId, riskName, event.referralId
            ))
        } else {
            notifications.add(Notification.createForInitiator(
                event.initiatorId, event.studentId, riskName, event.referralId
            ))
            notifications.add(Notification.createForHeadCounsellor(
                headCounsellorId, event.studentId, riskName, event.referralId
            ))
        }

        return notifications
    }
}
