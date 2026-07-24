package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.ProfileSummaryDto
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.Teacher
import com.medicalsystem.backend.model.TrialAdmin
import com.medicalsystem.backend.repository.CollegeRepository
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val collegeRepository: CollegeRepository,
    private val hospitalRepository: HospitalRepository
) {

    fun getStudentProfile(user: User): ProfileSummaryDto {
        val student = studentRepository.findById(user.id)
            .orElseThrow { RuntimeException("Student not found for user ${user.id}") }

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
        val teacherUser = userRepository.findById(user.id)
            .orElseThrow { RuntimeException("Teacher not found for user ${user.id}") } as Teacher
        
        val departmentName = collegeRepository.findById(teacherUser.collegeId).orElse(null)?.name
        
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = teacherUser.employeeNumber.value,
            department = departmentName
        )
    }

    fun getHeadCounsellorProfile(user: User): ProfileSummaryDto {
        val headCounsellor = userRepository.findById(user.id)
            .orElseThrow { RuntimeException("Head Counsellor not found for user ${user.id}") }
        
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            // TODO: Add actual employeeNumber to HeadCounsellor entity
            employeeId = "HC-${headCounsellor.id}",
            // TODO: Add actual department mapping to HeadCounsellor entity
            department = "咨询中心"
        )
    }

    fun getTrialAdminProfile(user: User): ProfileSummaryDto {
        val trialAdmin = userRepository.findById(user.id)
            .orElseThrow { RuntimeException("Trial Admin not found for user ${user.id}") } as TrialAdmin
        
        val hospitalName = hospitalRepository.findById(trialAdmin.hospitalId).orElse(null)?.name
            ?: "未分配医院"

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = trialAdmin.employeeNumber.value,
            hospital = hospitalName
        )
    }
}
