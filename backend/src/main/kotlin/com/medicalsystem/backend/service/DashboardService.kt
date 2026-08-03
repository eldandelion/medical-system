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
    private val referralRepository: ReferralRepository
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
}
