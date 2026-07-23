package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.ProfileSummaryDto
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class DashboardService(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository
) {

    fun getStudentProfile(user: User): ProfileSummaryDto {
        val student = studentRepository.findById(user.id)
            .orElseThrow { RuntimeException("Student not found for user ${user.id}") }

        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            title = user.name,
            subtitle = "Student", 
            studentId = student.studentNumber,
            school = student.major.college.name,
            department = student.major.name
        )
    }

    fun getTeacherProfile(user: User): ProfileSummaryDto {
        val teacherUser = userRepository.findById(user.id)
            .orElseThrow { RuntimeException("Teacher not found for user ${user.id}") }
        
        return ProfileSummaryDto(
            avatarUrl = user.avatarUrl?.toString(),
            title = user.name,
            subtitle = "Teacher",
            employeeId = user.id.toString(), // TODO: Maps to actual employee ID later if different from user ID
            department = null // TODO: Maps to college via CollegeRepository if needed
        )
    }
}
