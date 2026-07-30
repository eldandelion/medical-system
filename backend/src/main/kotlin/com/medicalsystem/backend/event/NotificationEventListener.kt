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
    private val notificationService: NotificationService
) {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleReferralInitiated(event: ReferralInitiatedEvent) {
        // Placeholder ID resolving until we have user mapping
        val targetUserId = 0L 
        
        notificationService.createNotification(
            userId = targetUserId,
            messageCode = NotificationMessageCode.REFERRAL_INITIATED,
            messageArgs = listOf(event.studentId.toString(), event.riskLevel),
            actionType = NotificationActionType.REVIEW_REFERRAL,
            actionTargetId = event.referralId
        )
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