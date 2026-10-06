package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class DashboardService(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val collegeRepository: CollegeRepository,
    private val hospitalRepository: HospitalRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository,
    private val teacherRepository: TeacherRepository,
    private val doctorRepository: DoctorRepository,
    private val trialAdminRepository: TrialAdminRepository,
    private val headCounsellorRepository: HeadCounsellorRepository,
    private val schoolDepartmentRepository: SchoolDepartmentRepository,
    private val notificationRepository: NotificationRepository,
    private val referralRepository: ReferralRepository,
    private val userJpaRepository: com.medicalsystem.backend.repository.UserJpaRepository,
    private val assessmentAssignmentRepository: com.medicalsystem.backend.repository.AssessmentAssignmentJpaRepository,
    private val referralJpaRepository: com.medicalsystem.backend.repository.ReferralJpaRepository,
    private val notificationJpaRepository: com.medicalsystem.backend.repository.NotificationJpaRepository
) {

    private fun validateRole(user: User, expectedRole: UserRole) {
        if (user.role != expectedRole) {
            throw ForbiddenException("Access denied for role ${user.role} on ${expectedRole.name.lowercase()} dashboard")
        }
    }

    fun getStudentProfile(user: User): ProfileSummaryDto {
        val student = studentRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Student not found for user ${user.id}") }

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role, 
            studentId = student.studentNumber,
            school = student.major.college.name,
            department = student.major.name
        )
    }

    fun getTeacherProfile(user: User): ProfileSummaryDto {
        val teacherEntity = teacherRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Teacher not found for user ${user.id}") }
        
        val college = collegeRepository.findById(teacherEntity.college.id!!)
            .orElseThrow { ResourceNotFoundException("College not found for teacher ${teacherEntity.userId}") }
        
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = teacherEntity.employeeNumber,
            department = college.name
        )
    }

    fun getDoctorProfile(user: User): ProfileSummaryDto {
        val doctorEntity = doctorRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Doctor not found for user ${user.id}") }
            
        val department = hospitalDepartmentRepository.findById(doctorEntity.department!!.id!!)
            .orElseThrow { ResourceNotFoundException("Department not found for doctor ${doctorEntity.userId}") }

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = doctorEntity.employeeNumber,
            hospital = department.hospital.name,
            department = department.name
        )
    }

    fun getHeadCounsellorProfile(user: User): ProfileSummaryDto {
        val headCounsellor = headCounsellorRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Head Counsellor not found for user ${user.id}") }
            
        val department = schoolDepartmentRepository.findById(headCounsellor.departmentId)
            .orElseThrow { ResourceNotFoundException("Department not found for head counsellor ${headCounsellor.userId}") }
        
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = headCounsellor.employeeNumber.value,
            department = department.name
        )
    }

    fun getTrialAdminProfile(user: User): ProfileSummaryDto {
        val trialAdminEntity = trialAdminRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Trial Admin not found for user ${user.id}") }
        
        val hospital = hospitalRepository.findById(trialAdminEntity.hospital.id!!)
            .orElseThrow { ResourceNotFoundException("Hospital not found for trial admin ${trialAdminEntity.userId}") }

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = trialAdminEntity.employeeNumber,
            hospital = hospital.name
        )
    }

    fun getStudentDashboard(user: User): DashboardResponseDto<StudentMetricsDto> {
        validateRole(user, UserRole.STUDENT)
        val unreadCount = notificationRepository.countUnreadByUserId(user.id)
        return DashboardResponseDto(StudentMetricsDto(assessmentsCount = 0L, notificationsCount = unreadCount))
    }

    fun getTeacherDashboard(user: User): DashboardResponseDto<TeacherMetricsDto> {
        validateRole(user, UserRole.TEACHER)
        val studentsCount = studentRepository.countVisibleStudentsFor(user)
        val unreadCount = notificationRepository.countUnreadByUserId(user.id)
        return DashboardResponseDto(TeacherMetricsDto(studentsCount = studentsCount, notificationsCount = unreadCount))
    }

    fun getHeadCounsellorDashboard(user: User): DashboardResponseDto<HeadCounsellorMetricsDto> {
        validateRole(user, UserRole.HEAD_COUNSELLOR)
        val studentsCount = studentRepository.countVisibleStudentsFor(user)
        val referralsCount = referralRepository.countActionableReferralsFor(user)
        return DashboardResponseDto(HeadCounsellorMetricsDto(studentsCount = studentsCount, referralsCount = referralsCount))
    }

    fun getTrialAdminDashboard(user: User): DashboardResponseDto<TrialAdminMetricsDto> {
        validateRole(user, UserRole.TRIAL_ADMIN)
        val trialAdminEntity = trialAdminRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Trial Admin not found for user ${user.id}") }
        val hospitalId = trialAdminEntity.hospital.id ?: 0L
        val staffCount = doctorRepository.countByDepartmentHospitalId(hospitalId)
        val referralsCount = referralRepository.countActionableReferralsFor(user)
        return DashboardResponseDto(TrialAdminMetricsDto(staffCount = staffCount, referralsCount = referralsCount))
    }

    fun getDoctorDashboard(user: User): DashboardResponseDto<DoctorMetricsDto> {
        validateRole(user, UserRole.DOCTOR)
        val referralsCount = referralRepository.countActionableReferralsFor(user)
        val unreadCount = notificationRepository.countUnreadByUserId(user.id)
        return DashboardResponseDto(DoctorMetricsDto(referralsCount = referralsCount, notificationsCount = unreadCount))
    }

    fun getAdminProfile(user: User): ProfileSummaryDto {
        validateRole(user, UserRole.SYSTEM_ADMIN)
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = "SYS-ADMIN",
            department = "系统管理部"
        )
    }

    fun getAdminDashboard(user: User): DashboardResponseDto<AdminMetricsDto> {
        validateRole(user, UserRole.SYSTEM_ADMIN)
        val allUsers = userJpaRepository?.findAll() ?: emptyList()
        val totalUsersCount = allUsers.count { it.status != com.medicalsystem.backend.model.AccountStatus.DELETED }.toLong()
        val pendingApprovalsCount = allUsers.count { it.status == com.medicalsystem.backend.model.AccountStatus.PENDING_APPROVAL }.toLong()
        val activeReferralsCount = referralRepository.countActionableReferralsFor(user)
        val completedAssessmentsCount = assessmentAssignmentRepository?.countByStatus(com.medicalsystem.backend.model.AssessmentStatus.COMPLETED) ?: 0L

        return DashboardResponseDto(
            AdminMetricsDto(
                totalUsersCount = totalUsersCount,
                pendingApprovalsCount = pendingApprovalsCount,
                activeReferralsCount = activeReferralsCount,
                completedAssessmentsCount = completedAssessmentsCount
            )
        )
    }

    fun getRecentActivity(user: User): DashboardActivityFeedDto {
        val activities = mutableListOf<DashboardActivityDto>()
        
        when (user.role) {
            UserRole.STUDENT -> {
                val notifications = notificationJpaRepository.findTop5ByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.id)
                val assessments = assessmentAssignmentRepository.findTop5ByStudentIdAndStatusOrderByAssignedAtDesc(user.id, com.medicalsystem.backend.model.AssessmentStatus.PENDING)
                
                activities.addAll(notifications.map {
                    DashboardActivityDto(
                        id = "notif-${it.id}",
                        type = ActivityType.UNREAD_NOTIFICATION,
                        timestamp = it.createdAt.atZone(java.time.ZoneId.systemDefault()).toInstant(),
                        referenceId = it.id!!,
                        referenceName = it.messageCode.name
                    )
                })
                
                activities.addAll(assessments.map {
                    DashboardActivityDto(
                        id = "assess-${it.id}",
                        type = ActivityType.ASSESSMENT_PENDING_COMPLETION,
                        timestamp = it.assignedAt.atZone(java.time.ZoneId.systemDefault()).toInstant(),
                        referenceId = it.id!!,
                        referenceName = it.batteryCode
                    )
                })
            }
            UserRole.TEACHER -> {
                // Fetch unread notifications
                val notifications = notificationJpaRepository.findTop5ByUserIdAndIsReadFalseOrderByCreatedAtDesc(user.id)
                activities.addAll(notifications.map {
                    DashboardActivityDto(
                        id = "notif-${it.id}",
                        type = ActivityType.UNREAD_NOTIFICATION,
                        timestamp = it.createdAt.atZone(java.time.ZoneId.systemDefault()).toInstant(),
                        referenceId = it.id!!,
                        referenceName = it.messageCode.name
                    )
                })
            }
            UserRole.HEAD_COUNSELLOR -> {
                val referrals = referralJpaRepository.findTop5ByStatusInOrderByCreatedAtDesc(listOf(com.medicalsystem.backend.model.ReferralStatus.AWAITING_TRIAGE))
                activities.addAll(referrals.map {
                    DashboardActivityDto(
                        id = "ref-${it.id}",
                        type = ActivityType.REFERRAL_PENDING_TRIAGE,
                        timestamp = it.createdAt.atZone(java.time.ZoneId.systemDefault()).toInstant(),
                        referenceId = it.id!!,
                        referenceName = it.title
                    )
                })
            }
            UserRole.TRIAL_ADMIN -> {
                val referrals = referralJpaRepository.findTop5ByStatusInOrderByCreatedAtDesc(listOf(com.medicalsystem.backend.model.ReferralStatus.WAITING_FOR_SCHEDULING))
                activities.addAll(referrals.map {
                    DashboardActivityDto(
                        id = "ref-${it.id}",
                        type = ActivityType.REFERRAL_PENDING_SCHEDULING,
                        timestamp = it.createdAt.atZone(java.time.ZoneId.systemDefault()).toInstant(),
                        referenceId = it.id!!,
                        referenceName = it.title
                    )
                })
            }
            UserRole.DOCTOR -> {
                val referrals = referralJpaRepository.findTop5ByStatusInOrderByCreatedAtDesc(listOf(com.medicalsystem.backend.model.ReferralStatus.WAITING_FOR_APPOINTMENT, com.medicalsystem.backend.model.ReferralStatus.AWAITING_FEEDBACK_APPROVAL))
                activities.addAll(referrals.map {
                    DashboardActivityDto(
                        id = "ref-${it.id}",
                        type = ActivityType.REFERRAL_PENDING_FEEDBACK,
                        timestamp = it.createdAt.atZone(java.time.ZoneId.systemDefault()).toInstant(),
                        referenceId = it.id!!,
                        referenceName = it.title
                    )
                })
            }
            UserRole.SYSTEM_ADMIN -> {
                val users = userJpaRepository.findTop5ByStatusOrderByIdDesc(com.medicalsystem.backend.model.AccountStatus.PENDING_APPROVAL)
                activities.addAll(users.map {
                    DashboardActivityDto(
                        id = "user-${it.id}",
                        type = ActivityType.USER_APPROVAL_PENDING,
                        timestamp = (it.deletedAt ?: java.time.Instant.now()),
                        referenceId = it.id,
                        referenceName = it.name
                    )
                })
            }
        }
        
        activities.sortByDescending { it.timestamp }
        return DashboardActivityFeedDto(activities.take(5))
    }
}
