package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.ProfileSummaryDto
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.Teacher
import com.medicalsystem.backend.model.TrialAdmin
import com.medicalsystem.backend.model.Doctor
import com.medicalsystem.backend.repository.CollegeRepository
import com.medicalsystem.backend.repository.DepartmentRepository
import com.medicalsystem.backend.repository.HospitalRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.exception.ResourceNotFoundException
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val collegeRepository: CollegeRepository,
    private val hospitalRepository: HospitalRepository,
    private val departmentRepository: DepartmentRepository
) {

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
        val teacherUser = userRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Teacher not found for user ${user.id}") } as Teacher
        
        val college = collegeRepository.findById(teacherUser.collegeId)
            .orElseThrow { ResourceNotFoundException("College not found for teacher ${teacherUser.id}") }
        
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = teacherUser.employeeNumber.value,
            department = college.name
        )
    }

    fun getDoctorProfile(user: User): ProfileSummaryDto {
        val doctor = userRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Doctor not found for user ${user.id}") } as Doctor
            
        val department = departmentRepository.findById(doctor.departmentId)
            .orElseThrow { ResourceNotFoundException("Department not found for doctor ${doctor.id}") }

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = doctor.employeeNumber.value,
            hospital = department.hospital.name,
            department = department.name
        )
    }

    fun getHeadCounsellorProfile(user: User): ProfileSummaryDto {
        val headCounsellor = userRepository.findById(user.id)
            .orElseThrow { ResourceNotFoundException("Head Counsellor not found for user ${user.id}") }
        
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
            .orElseThrow { ResourceNotFoundException("Trial Admin not found for user ${user.id}") } as TrialAdmin
        
        val hospital = hospitalRepository.findById(trialAdmin.hospitalId)
            .orElseThrow { ResourceNotFoundException("Hospital not found for trial admin ${trialAdmin.id}") }

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            name = user.name,
            role = user.role,
            employeeId = trialAdmin.employeeNumber.value,
            hospital = hospital.name
        )
    }
}
