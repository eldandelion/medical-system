package com.medicalsystem.backend.policy

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.event.ReferralStatusChangedEvent
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.Mockito.*
import org.mockito.junit.jupiter.MockitoExtension
import java.time.LocalDateTime
import java.util.Optional
import kotlin.test.assertEquals
import kotlin.test.assertTrue

@ExtendWith(MockitoExtension::class)
class LifecycleNotificationRoutingPolicyTest {

    @Mock
    private lateinit var studentRepository: StudentRepository
    @Mock
    private lateinit var trialAdminRepository: TrialAdminRepository
    @Mock
    private lateinit var headCounsellorRepository: HeadCounsellorRepository

    private lateinit var policy: LifecycleNotificationRoutingPolicy

    @BeforeEach
    fun setup() {
        policy = LifecycleNotificationRoutingPolicy(
            studentRepository, trialAdminRepository, headCounsellorRepository
        )
    }

    @Test
    fun `shouldRouteToAdminTeacherAndStudent_WhenStatusChangesToAwaitingTriage`() {
        // Arrange
        val event = ReferralStatusChangedEvent(
            referralId = 1L,
            oldStatus = ReferralStatus.AWAITING_APPROVAL,
            newStatus = ReferralStatus.AWAITING_TRIAGE,
            studentId = 10L
        )
        
        val referral = mock(Referral::class.java)
        `when`(referral.referredById).thenReturn(20L)
        `when`(referral.riskLevel).thenReturn(RiskStatus.MEDIUM)
        val destination = ReferralDestination.Submitted(HospitalId(100L), null)
        `when`(referral.destination).thenReturn(destination)
        
        val student = mock(Student::class.java)
        `when`(student.id).thenReturn(10L)
        `when`(student.name).thenReturn("Test Student")
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))
        
        val admin = mock(com.medicalsystem.backend.entity.TrialAdminEntity::class.java)
        `when`(admin.userId).thenReturn(30L)
        `when`(trialAdminRepository.findByHospitalId(100L)).thenReturn(listOf(admin))

        // Act
        val notifications = policy.determineNotifications(event, referral)

        // Assert
        assertEquals(3, notifications.size)
        assertTrue(notifications.any { it.userId == 30L && it.messageCode == NotificationMessageCode.REFERRAL_NEEDS_TRIAGE_ADMIN && it.actionType == NotificationActionType.ASSIGN_DOCTOR })
        assertTrue(notifications.any { it.userId == 20L && it.messageCode == NotificationMessageCode.REFERRAL_APPROVED_BY_HC_TEACHER && it.actionType == NotificationActionType.VIEW_REFERRAL })
        assertTrue(notifications.any { it.userId == 10L && it.messageCode == NotificationMessageCode.REFERRAL_APPROVED_BY_HC_STUDENT && it.actionType == NotificationActionType.VIEW_REFERRAL })
    }

    @Test
    fun `shouldRouteToDoctorAndSchoolStaff_WhenStatusChangesToWaitingForScheduling`() {
        // Arrange
        val event = ReferralStatusChangedEvent(1L, ReferralStatus.AWAITING_TRIAGE, ReferralStatus.WAITING_FOR_SCHEDULING, 10L)
        val referral = mock(Referral::class.java)
        `when`(referral.id).thenReturn(1L)
        `when`(referral.referredById).thenReturn(20L)
        val destination = ReferralDestination.Triaged(HospitalId(100L), TriageAdminId(30L), HospitalDepartmentId(50L), DoctorId(40L), null)
        `when`(referral.destination).thenReturn(destination)
        
        val student = mock(Student::class.java)
        `when`(student.id).thenReturn(10L)
        `when`(student.name).thenReturn("Test Student")
        
        val headCounsellor = mock(HeadCounsellor::class.java)
        `when`(headCounsellor.userId).thenReturn(50L)
        val school = mock(School::class.java)
        `when`(school.id).thenReturn(200L)
        val demographics = mock(Demographics::class.java)
        `when`(demographics.school).thenReturn(school)
        `when`(student.demographics).thenReturn(demographics)
        
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))
        `when`(headCounsellorRepository.findBySchoolId(200L)).thenReturn(Optional.of(headCounsellor))

        // Act
        val notifications = policy.determineNotifications(event, referral)

        // Assert
        assertEquals(4, notifications.size)
        assertTrue(notifications.any { it.userId == 40L && it.messageCode == NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_DOCTOR && it.actionType == NotificationActionType.CREATE_APPOINTMENT })
        assertTrue(notifications.any { it.userId == 20L && it.messageCode == NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_TEACHER && it.actionType == NotificationActionType.VIEW_REFERRAL })
        assertTrue(notifications.any { it.userId == 10L && it.messageCode == NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_STUDENT && it.actionType == NotificationActionType.VIEW_REFERRAL })
        assertTrue(notifications.any { it.userId == 50L && it.messageCode == NotificationMessageCode.REFERRAL_DOCTOR_ASSIGNED_HC && it.actionType == NotificationActionType.VIEW_REFERRAL })
    }

    @Test
    fun `shouldRouteToAll_WhenStatusChangesToWaitingForAppointment`() {
        // Arrange
        val event = ReferralStatusChangedEvent(1L, ReferralStatus.WAITING_FOR_SCHEDULING, ReferralStatus.WAITING_FOR_APPOINTMENT, 10L)
        val referral = mock(Referral::class.java)
        `when`(referral.id).thenReturn(1L)
        `when`(referral.referredById).thenReturn(20L)
        
        val destination = ReferralDestination.Triaged(HospitalId(100L), TriageAdminId(30L), HospitalDepartmentId(50L), DoctorId(40L), null)
        `when`(referral.destination).thenReturn(destination)
        
        val student = mock(Student::class.java)
        `when`(student.id).thenReturn(10L)
        
        val headCounsellor = mock(HeadCounsellor::class.java)
        `when`(headCounsellor.userId).thenReturn(50L)
        val school = mock(School::class.java)
        `when`(school.id).thenReturn(200L)
        val demographics = mock(Demographics::class.java)
        `when`(demographics.school).thenReturn(school)
        `when`(student.demographics).thenReturn(demographics)
        
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))
        `when`(headCounsellorRepository.findBySchoolId(200L)).thenReturn(Optional.of(headCounsellor))
        
        val admin = mock(com.medicalsystem.backend.entity.TrialAdminEntity::class.java)
        `when`(admin.userId).thenReturn(30L)
        `when`(trialAdminRepository.findByHospitalId(100L)).thenReturn(listOf(admin))

        // Act
        val notifications = policy.determineNotifications(event, referral)

        // Assert
        assertEquals(4, notifications.size)
        assertTrue(notifications.any { it.userId == 10L && it.messageCode == NotificationMessageCode.REFERRAL_SCHEDULED_STUDENT })
        assertTrue(notifications.any { it.userId == 20L && it.messageCode == NotificationMessageCode.REFERRAL_SCHEDULED_TEACHER })
        assertTrue(notifications.any { it.userId == 50L && it.messageCode == NotificationMessageCode.REFERRAL_SCHEDULED_HC })
        assertTrue(notifications.any { it.userId == 30L && it.messageCode == NotificationMessageCode.REFERRAL_SCHEDULED_ADMIN })
    }

    @Test
    fun `shouldRouteToAll_WhenStatusChangesToAwaitingFeedbackApproval`() {
        val event = ReferralStatusChangedEvent(1L, ReferralStatus.WAITING_FOR_APPOINTMENT, ReferralStatus.AWAITING_FEEDBACK_APPROVAL, 10L)
        val referral = mock(Referral::class.java)
        `when`(referral.id).thenReturn(1L)
        `when`(referral.referredById).thenReturn(20L)
        
        val destination = ReferralDestination.Triaged(HospitalId(100L), TriageAdminId(30L), HospitalDepartmentId(50L), DoctorId(40L), null)
        `when`(referral.destination).thenReturn(destination)
        
        val student = mock(Student::class.java)
        `when`(student.id).thenReturn(10L)
        
        val headCounsellor = mock(HeadCounsellor::class.java)
        `when`(headCounsellor.userId).thenReturn(50L)
        val school = mock(School::class.java)
        `when`(school.id).thenReturn(200L)
        val demographics = mock(Demographics::class.java)
        `when`(demographics.school).thenReturn(school)
        `when`(student.demographics).thenReturn(demographics)
        
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))
        `when`(headCounsellorRepository.findBySchoolId(200L)).thenReturn(Optional.of(headCounsellor))
        
        val admin = mock(com.medicalsystem.backend.entity.TrialAdminEntity::class.java)
        `when`(admin.userId).thenReturn(30L)
        `when`(trialAdminRepository.findByHospitalId(100L)).thenReturn(listOf(admin))

        val notifications = policy.determineNotifications(event, referral)

        assertEquals(4, notifications.size)
        assertTrue(notifications.any { it.userId == 10L && it.messageCode == NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_STUDENT })
        assertTrue(notifications.any { it.userId == 20L && it.messageCode == NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_TEACHER })
        assertTrue(notifications.any { it.userId == 50L && it.messageCode == NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_HC })
        assertTrue(notifications.any { it.userId == 30L && it.messageCode == NotificationMessageCode.REFERRAL_FEEDBACK_SUBMITTED_ADMIN })
    }

    @Test
    fun `shouldRouteToStudentAndTeacher_WhenStatusChangesToClosed`() {
        val event = ReferralStatusChangedEvent(1L, ReferralStatus.AWAITING_FEEDBACK_APPROVAL, ReferralStatus.CLOSED, 10L)
        val referral = mock(Referral::class.java)
        `when`(referral.id).thenReturn(1L)
        `when`(referral.referredById).thenReturn(20L)
        
        val student = mock(Student::class.java)
        `when`(student.id).thenReturn(10L)
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))

        val notifications = policy.determineNotifications(event, referral)

        assertEquals(2, notifications.size)
        assertTrue(notifications.any { it.userId == 10L && it.messageCode == NotificationMessageCode.REFERRAL_CLOSED_STUDENT })
        assertTrue(notifications.any { it.userId == 20L && it.messageCode == NotificationMessageCode.REFERRAL_CLOSED_TEACHER })
    }

    @Test
    fun `shouldRouteToAllRelevant_WhenStatusChangesToRejectedFromTriage`() {
        val event = ReferralStatusChangedEvent(1L, ReferralStatus.AWAITING_TRIAGE, ReferralStatus.REJECTED, 10L)
        val referral = mock(Referral::class.java)
        `when`(referral.id).thenReturn(1L)
        `when`(referral.referredById).thenReturn(20L)
        
        val student = mock(Student::class.java)
        `when`(student.id).thenReturn(10L)
        
        val headCounsellor = mock(HeadCounsellor::class.java)
        `when`(headCounsellor.userId).thenReturn(50L)
        val school = mock(School::class.java)
        `when`(school.id).thenReturn(200L)
        val demographics = mock(Demographics::class.java)
        `when`(demographics.school).thenReturn(school)
        `when`(student.demographics).thenReturn(demographics)
        
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))
        `when`(headCounsellorRepository.findBySchoolId(200L)).thenReturn(Optional.of(headCounsellor))

        val notifications = policy.determineNotifications(event, referral)

        assertEquals(3, notifications.size)
        assertTrue(notifications.any { it.userId == 10L && it.messageCode == NotificationMessageCode.REFERRAL_REJECTED_STUDENT })
        assertTrue(notifications.any { it.userId == 20L && it.messageCode == NotificationMessageCode.REFERRAL_REJECTED_TEACHER })
        assertTrue(notifications.any { it.userId == 50L && it.messageCode == NotificationMessageCode.REFERRAL_REJECTED_HC })
    }

    @Test
    fun `shouldRouteToAdmin_WhenStatusChangesToNeedsReassignment`() {
        val event = ReferralStatusChangedEvent(1L, ReferralStatus.WAITING_FOR_SCHEDULING, ReferralStatus.NEEDS_REASSIGNMENT, 10L)
        val referral = mock(Referral::class.java)
        `when`(referral.id).thenReturn(1L)
        
        val destination = ReferralDestination.Triaged(HospitalId(100L), TriageAdminId(30L), HospitalDepartmentId(50L), DoctorId(40L), null)
        `when`(referral.destination).thenReturn(destination)
        
        val student = mock(Student::class.java)
        `when`(studentRepository.findById(10L)).thenReturn(Optional.of(student))
        
        val admin = mock(com.medicalsystem.backend.entity.TrialAdminEntity::class.java)
        `when`(admin.userId).thenReturn(30L)
        `when`(trialAdminRepository.findByHospitalId(100L)).thenReturn(listOf(admin))

        val notifications = policy.determineNotifications(event, referral)

        assertEquals(1, notifications.size)
        assertTrue(notifications.any { it.userId == 30L && it.messageCode == NotificationMessageCode.REFERRAL_NEEDS_REASSIGNMENT_ADMIN })
    }
}
