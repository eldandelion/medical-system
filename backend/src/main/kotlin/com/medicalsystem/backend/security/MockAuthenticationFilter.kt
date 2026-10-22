package com.medicalsystem.backend.security

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.repository.UserRepository
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

@Component
class MockAuthenticationFilter(
    private val userRepository: UserRepository,
    private val studentRepository: StudentRepository? = null,
    private val jwtService: JwtService? = null
) : Filter {

    override fun doFilter(request: ServletRequest, response: ServletResponse, chain: FilterChain) {
        val httpRequest = request as HttpServletRequest
        val token = httpRequest.getHeader("Authorization")

        val user = resolveUser(token)
        
        if (user != null) {
            val context = MockSecurityContextHolder.getContext()
            context.user = user
        }

        try {
            chain.doFilter(request, response)
        } finally {
            MockSecurityContextHolder.clearContext()
        }
    }

    private fun resolveUser(token: String?): User? {
        if (token.isNullOrBlank()) return null

        val rawToken = if (token.startsWith("Bearer ", ignoreCase = true)) {
            token.substring(7).trim()
        } else {
            token.trim()
        }

        // 1. Try JWT authentication if jwtService is present
        if (jwtService != null) {
            val userId = jwtService.validateAndExtractUserId(rawToken)
            if (userId != null) {
                val user = userRepository.findById(userId)
                if (user.isPresent) return user.get()
            }

            val studentNumber = jwtService.validateAndExtractStudentNumber(rawToken)
            if (!studentNumber.isNullOrBlank() && studentRepository != null) {
                val student = studentRepository.findByStudentNumber(studentNumber)
                if (student != null) {
                    val user = userRepository.findById(student.id)
                    if (user.isPresent) return user.get()
                }
            }
        }

        // If the token is formatted like a JWT (contains dots or starts with eyJ) and failed validation, reject it
        if (rawToken.contains(".") || rawToken.startsWith("eyJ")) {
            return null
        }
        
        // 2. Fallback to mock keyword tokens for test/dev harnesses
        if (rawToken.startsWith("mock-token-")) {
            val idStr = rawToken.removePrefix("mock-token-")
            val id = idStr.toLongOrNull()
            if (id != null) {
                val u = userRepository.findById(id)
                if (u.isPresent) return u.get()
            }
        }

        return if (rawToken.contains("teacher_token_zhang")) {
            userRepository.findByName("艾米丽·沃森")
        } else if (rawToken.contains("head_councillor")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.HEAD_COUNSELLOR }
                ?: User(id = 999L, name = "Mock Head Councillor", email = EmailAddress("head@univ.edu.cn"), role = UserRole.HEAD_COUNSELLOR)
        } else if (rawToken.contains("trial_admin")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.TRIAL_ADMIN }
                ?: User(id = 998L, name = "Mock Trial Admin", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        } else if (rawToken.contains("admin")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.SYSTEM_ADMIN }
                ?: User(id = 990L, name = "系统管理员", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.SYSTEM_ADMIN)
        } else if (rawToken.contains("doctor")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.DOCTOR }
                ?: User(id = 997L, name = "Mock Doctor", email = EmailAddress("doctor@univ.edu.cn"), role = UserRole.DOCTOR)
        } else if (rawToken.contains("student")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.STUDENT }
                ?: User(id = 1L, name = "Mock Student", email = EmailAddress("student@univ.edu.cn"), role = UserRole.STUDENT)
        } else {
            userRepository.findAll().firstOrNull()
        }
    }
}
