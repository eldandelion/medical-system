package com.medicalsystem.backend.event

import com.medicalsystem.backend.service.NotificationService
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.model.ReferralStatus
import org.springframework.stereotype.Component
import org.springframework.scheduling.annotation.Async
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class NotificationEventListener(
    private val notificationService: NotificationService,
    private val headCounsellorRepository: com.medicalsystem.backend.repository.HeadCounsellorRepository
) {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleReferralInitiated(event: ReferralInitiatedEvent) {
        notifyStudent(event)
        notifyInitiatorAndHeadCounsellor(event)
    }

    private fun notifyStudent(event: ReferralInitiatedEvent) {
        val notification = com.medicalsystem.backend.model.Notification.createForStudent(event.studentId, event.riskLevel)
        notificationService.saveNotification(notification)
    }

    private fun notifyInitiatorAndHeadCounsellor(event: ReferralInitiatedEvent) {
        val headCounsellor = headCounsellorRepository.findAll().firstOrNull()

        if (headCounsellor == null) {
            notificationService.saveNotification(
                com.medicalsystem.backend.model.Notification.createForInitiator(event.initiatorId, event.studentId, event.riskLevel, event.referralId)
            )
            return
        }

        if (event.initiatorId == headCounsellor.userId) {
            notificationService.saveNotification(
                com.medicalsystem.backend.model.Notification.createDeduplicatedForHcInitiator(
                    headCounsellor.userId, event.studentId, event.riskLevel, event.referralId
                )
            )
        } else {
            notificationService.saveNotification(
                com.medicalsystem.backend.model.Notification.createForInitiator(
                    event.initiatorId, event.studentId, event.riskLevel, event.referralId
                )
            )
            notificationService.saveNotification(
                com.medicalsystem.backend.model.Notification.createForHeadCounsellor(
                    headCounsellor.userId, event.studentId, event.riskLevel, event.referralId
                )
            )
        }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleReferralStatusChanged(event: ReferralStatusChangedEvent) {
        if (event.newStatus == ReferralStatus.CLOSED) {
            notificationService.invalidateActions(
                actionType = NotificationActionType.REVIEW_REFERRAL,
                targetId = event.referralId
            )
        }
    }
}