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

    private fun extractAvatarText(name: String?): String {
        val trimmed = name?.trim()
        return if (trimmed.isNullOrEmpty()) "?" else trimmed.substring(0, 1).uppercase()
    }

    fun getStudentProfile(user: User): ProfileSummaryDto {
        val student = studentRepository.findById(user.id)
            .orElseThrow { RuntimeException("Student not found for user ${user.id}") }

        return ProfileSummaryDto(
            avatarText = extractAvatarText(user.name),
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
            avatarText = extractAvatarText(user.name),
            title = user.name,
            subtitle = "Teacher",
            employeeId = user.id.toString(), // TODO: Maps to actual employee ID later if different from user ID
            department = null // TODO: Maps to college via CollegeRepository if needed
        )
    }
}
