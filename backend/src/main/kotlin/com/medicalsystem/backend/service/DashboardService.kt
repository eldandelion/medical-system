package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.ProfileSummaryDto
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.repository.*
import com.medicalsystem.backend.exception.ResourceNotFoundException
import org.springframework.stereotype.Service

@Service
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
    private val schoolDepartmentRepository: SchoolDepartmentRepository
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
            employeeId = "HC-${headCounsellor.userId}",
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
}
