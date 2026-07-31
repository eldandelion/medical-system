package com.medicalsystem.backend.model

import java.time.LocalDateTime

data class Notification(
    val id: Long? = null,
    val userId: Long,
    val messageCode: NotificationMessageCode,
    val messageArgs: List<String> = emptyList(),
    var isRead: Boolean = false,
    val createdAt: LocalDateTime = LocalDateTime.now(),
    val actionType: NotificationActionType = NotificationActionType.NONE,
    val actionTargetId: Long? = null,
    var isActionAvailable: Boolean = (actionType != NotificationActionType.NONE)
) {
    fun markAsRead() {
        this.isRead = true
    }

    fun invalidateAction() {
        this.isActionAvailable = false
    }

    companion object {
        fun createForStudent(studentId: Long, riskLevel: String): Notification {
            return Notification(
                userId = studentId,
                messageCode = NotificationMessageCode.REFERRAL_SUBMITTED_STUDENT,
                messageArgs = listOf(riskLevel),
                actionType = NotificationActionType.NONE
            )
        }
        
        fun createForInitiator(initiatorId: Long, studentName: String, riskLevel: String, referralId: Long): Notification {
            return Notification(
                userId = initiatorId,
                messageCode = NotificationMessageCode.REFERRAL_SUBMITTED_INITIATOR,
                messageArgs = listOf(studentName, riskLevel),
                actionType = NotificationActionType.VIEW_REFERRAL,
                actionTargetId = referralId
            )
        }
        
        fun createForHeadCounsellor(hcId: Long, studentName: String, riskLevel: String, referralId: Long): Notification {
            return Notification(
                userId = hcId,
                messageCode = NotificationMessageCode.REFERRAL_REQUIRES_REVIEW_HC,
                messageArgs = listOf(studentName, riskLevel),
                actionType = NotificationActionType.REVIEW_REFERRAL,
                actionTargetId = referralId
            )
        }
        
    }
}