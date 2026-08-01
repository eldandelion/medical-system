package com.medicalsystem.backend.policy

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.event.ReferralStatusChangedEvent
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.TrialAdminRepository
import com.medicalsystem.backend.repository.HeadCounsellorRepository
import org.springframework.stereotype.Component

@Component
class LifecycleNotificationRoutingPolicy(
    private val studentRepository: StudentRepository,
    private val trialAdminRepository: TrialAdminRepository,
    private val headCounsellorRepository: HeadCounsellorRepository
) {
    fun determineNotifications(event: ReferralStatusChangedEvent, referral: Referral): List<Notification> {
        val notifications = mutableListOf<Notification>()
        val student = studentRepository.findById(event.studentId).orElse(null) ?: return emptyList()

        when (event.newStatus) {
            ReferralStatus.AWAITING_TRIAGE -> {
                val hospitalId = (referral.destination as? ReferralDestination.Submitted)?.hospitalId ?: return emptyList()
                val admins = trialAdminRepository.findByHospitalId(hospitalId.value)
                
                admins.forEach { admin ->
                    notifications.add(Notification(
                        userId = admin.userId,
                        messageCode = NotificationMessageCode.REFERRAL_NEEDS_TRIAGE_ADMIN,
                        payload = mapOf(
                            "studentName" to student.name,
                            "riskLevel" to referral.riskLevel.name
                        ),
                        actionType = NotificationActionType.ASSIGN_DOCTOR,
                        actionTargetId = referral.id
                    ))
                }

                notifications.add(Notification(
                    userId = referral.referredById,
                    messageCode = NotificationMessageCode.REFERRAL_APPROVED_BY_HC_TEACHER,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))

                notifications.add(Notification(
                    userId = student.id!!,
                    messageCode = NotificationMessageCode.REFERRAL_APPROVED_BY_HC_STUDENT,
                    payload = emptyMap(),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
            }
            ReferralStatus.WAITING_FOR_SCHEDULING -> {
                val triagedDest = referral.destination as? ReferralDestination.Triaged ?: return emptyList()
                val doctorId = triagedDest.doctorId.value
                val hcId = student.demographics?.school?.id?.let { headCounsellorRepository.findBySchoolId(it).orElse(null)?.userId }
                
                notifications.add(Notification(
                    userId = doctorId,
                    messageCode = NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_DOCTOR,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.CREATE_APPOINTMENT,
                    actionTargetId = referral.id
                ))
                notifications.add(Notification(
                    userId = referral.referredById,
                    messageCode = NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_TEACHER,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                notifications.add(Notification(
                    userId = student.id!!,
                    messageCode = NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_STUDENT,
                    payload = emptyMap(),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                if (hcId != null) {
                    notifications.add(Notification(
                        userId = hcId,
                        messageCode = NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_HC,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.VIEW_REFERRAL,
                        actionTargetId = referral.id
                    ))
                }
            }
            ReferralStatus.WAITING_FOR_APPOINTMENT -> {
                val triagedDest = referral.destination as? ReferralDestination.Triaged ?: return emptyList()
                val hcId = student.demographics?.school?.id?.let { headCounsellorRepository.findBySchoolId(it).orElse(null)?.userId }
                val admins = trialAdminRepository.findByHospitalId(triagedDest.hospitalId.value)
                
                notifications.add(Notification(
                    userId = student.id!!,
                    messageCode = NotificationMessageCode.REFERRAL_SCHEDULED_STUDENT,
                    payload = emptyMap(),
                    actionType = NotificationActionType.VIEW_APPOINTMENT,
                    actionTargetId = referral.id
                ))
                notifications.add(Notification(
                    userId = referral.referredById,
                    messageCode = NotificationMessageCode.REFERRAL_SCHEDULED_TEACHER,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.VIEW_APPOINTMENT,
                    actionTargetId = referral.id
                ))
                if (hcId != null) {
                    notifications.add(Notification(
                        userId = hcId,
                        messageCode = NotificationMessageCode.REFERRAL_SCHEDULED_HC,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.VIEW_APPOINTMENT,
                        actionTargetId = referral.id
                    ))
                }
                admins.forEach { admin ->
                    notifications.add(Notification(
                        userId = admin.userId,
                        messageCode = NotificationMessageCode.REFERRAL_SCHEDULED_ADMIN,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.VIEW_APPOINTMENT,
                        actionTargetId = referral.id
                    ))
                }
            }
            ReferralStatus.AWAITING_FEEDBACK_APPROVAL -> {
                val hcId = student.demographics?.school?.id?.let { headCounsellorRepository.findBySchoolId(it).orElse(null)?.userId }
                val triagedDest = referral.destination as? ReferralDestination.Triaged ?: return emptyList()
                val admins = trialAdminRepository.findByHospitalId(triagedDest.hospitalId.value)

                if (hcId != null) {
                    notifications.add(Notification(
                        userId = hcId,
                        messageCode = NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_HC,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.APPROVE_FEEDBACK,
                        actionTargetId = referral.id
                    ))
                }
                notifications.add(Notification(
                    userId = referral.referredById,
                    messageCode = NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_TEACHER,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                notifications.add(Notification(
                    userId = student.id!!,
                    messageCode = NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_STUDENT,
                    payload = emptyMap(),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                admins.forEach { admin ->
                    notifications.add(Notification(
                        userId = admin.userId,
                        messageCode = NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_ADMIN,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.VIEW_REFERRAL,
                        actionTargetId = referral.id
                    ))
                }
            }
            ReferralStatus.CLOSED -> {
                notifications.add(Notification(
                    userId = referral.referredById,
                    messageCode = NotificationMessageCode.REFERRAL_CLOSED_TEACHER,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                notifications.add(Notification(
                    userId = student.id!!,
                    messageCode = NotificationMessageCode.REFERRAL_CLOSED_STUDENT,
                    payload = emptyMap(),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
            }
            ReferralStatus.REJECTED -> {
                val hcId = student.demographics?.school?.id?.let { headCounsellorRepository.findBySchoolId(it).orElse(null)?.userId }
                
                notifications.add(Notification(
                    userId = referral.referredById,
                    messageCode = NotificationMessageCode.REFERRAL_REJECTED_TEACHER,
                    payload = mapOf("studentName" to student.name),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                notifications.add(Notification(
                    userId = student.id!!,
                    messageCode = NotificationMessageCode.REFERRAL_REJECTED_STUDENT,
                    payload = emptyMap(),
                    actionType = NotificationActionType.VIEW_REFERRAL,
                    actionTargetId = referral.id
                ))
                
                if (event.oldStatus == ReferralStatus.AWAITING_TRIAGE || event.oldStatus == ReferralStatus.NEEDS_REASSIGNMENT) {
                    if (hcId != null) {
                        notifications.add(Notification(
                            userId = hcId,
                            messageCode = NotificationMessageCode.REFERRAL_REJECTED_HC,
                            payload = mapOf("studentName" to student.name),
                            actionType = NotificationActionType.VIEW_REFERRAL,
                            actionTargetId = referral.id
                        ))
                    }
                }
            }
            ReferralStatus.NEEDS_REASSIGNMENT -> {
                val dest = referral.destination as? ReferralDestination.Triaged ?: return emptyList()
                val admins = trialAdminRepository.findByHospitalId(dest.hospitalId.value)
                admins.forEach { admin ->
                    notifications.add(Notification(
                        userId = admin.userId,
                        messageCode = NotificationMessageCode.REFERRAL_NEEDS_REASSIGNMENT_ADMIN,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.ASSIGN_DOCTOR,
                        actionTargetId = referral.id
                    ))
                }
            }
            ReferralStatus.RECALLED -> {
                val hcId = student.demographics?.school?.id?.let { headCounsellorRepository.findBySchoolId(it).orElse(null)?.userId }
                if (hcId != null) {
                    notifications.add(Notification(
                        userId = hcId,
                        messageCode = NotificationMessageCode.REFERRAL_RECALLED_HC,
                        payload = mapOf("studentName" to student.name),
                        actionType = NotificationActionType.VIEW_REFERRAL,
                        actionTargetId = referral.id
                    ))
                }
            }
            else -> {}
        }

        return notifications
    }
}
