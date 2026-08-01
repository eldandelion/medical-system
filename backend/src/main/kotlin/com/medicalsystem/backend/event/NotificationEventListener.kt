package com.medicalsystem.backend.event

import com.medicalsystem.backend.service.NotificationService
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.model.ReferralStatus
import org.springframework.stereotype.Component
import org.springframework.scheduling.annotation.Async
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.annotation.Propagation

@Component
@Transactional(propagation = Propagation.REQUIRES_NEW)
class NotificationEventListener(
    private val notificationService: NotificationService,
    private val headCounsellorRepository: com.medicalsystem.backend.repository.HeadCounsellorRepository,
    private val studentRepository: com.medicalsystem.backend.repository.StudentRepository,
    private val referralRepository: com.medicalsystem.backend.repository.ReferralRepository,
    private val routingPolicy: com.medicalsystem.backend.policy.NotificationRoutingPolicy<ReferralInitiatedEvent>,
    private val lifecycleRoutingPolicy: com.medicalsystem.backend.policy.LifecycleNotificationRoutingPolicy
) {
    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleReferralInitiated(event: ReferralInitiatedEvent) {
        val student = studentRepository.findById(event.studentId).orElse(null) ?: return
        val headCounsellorId = student.demographics?.school?.id?.let { 
            headCounsellorRepository.findBySchoolId(it).orElse(null)?.userId 
        }

        val notifications = routingPolicy.determineNotifications(event, headCounsellorId)

        notifications.forEach { notificationService.saveNotification(it) }
    }

    @Async
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleReferralStatusChanged(event: ReferralStatusChangedEvent) {
        val referral = referralRepository.findById(event.referralId).orElse(null) ?: return
        
        val notifications = lifecycleRoutingPolicy.determineNotifications(event, referral)
        notifications.forEach { notificationService.saveNotification(it) }

        if (event.newStatus == ReferralStatus.CLOSED) {
            notificationService.invalidateActions(
                actionType = NotificationActionType.REVIEW_REFERRAL,
                targetId = event.referralId
            )
        }
    }
}