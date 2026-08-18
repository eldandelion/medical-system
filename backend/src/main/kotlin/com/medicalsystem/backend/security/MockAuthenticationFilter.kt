package com.medicalsystem.backend.security

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.UserRepository
import jakarta.servlet.Filter
import jakarta.servlet.FilterChain
import jakarta.servlet.ServletRequest
import jakarta.servlet.ServletResponse
import jakarta.servlet.http.HttpServletRequest
import org.springframework.stereotype.Component

@Component
class MockAuthenticationFilter(
    private val userRepository: UserRepository
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
        
        return if (token.contains("teacher_token_zhang")) {
            userRepository.findByName("艾米丽·沃森")
        } else if (token.contains("head_councillor")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.HEAD_COUNSELLOR }
                ?: User(id = 999L, name = "Mock Head Councillor", email = EmailAddress("head@univ.edu.cn"), role = UserRole.HEAD_COUNSELLOR)
        } else if (token.contains("trial_admin")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.TRIAL_ADMIN }
                ?: User(id = 998L, name = "Mock Trial Admin", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        } else if (token.contains("admin")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.SYSTEM_ADMIN }
                ?: User(id = 990L, name = "系统管理员", email = EmailAddress("admin@univ.edu.cn"), role = UserRole.SYSTEM_ADMIN)
        } else if (token.contains("doctor")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.DOCTOR }
                ?: User(id = 997L, name = "Mock Doctor", email = EmailAddress("doctor@univ.edu.cn"), role = UserRole.DOCTOR)
        } else if (token.contains("student")) {
            userRepository.findAll().firstOrNull { it.role == UserRole.STUDENT }
                ?: User(id = 1L, name = "Mock Student", email = EmailAddress("student@univ.edu.cn"), role = UserRole.STUDENT)
        } else {
            userRepository.findAll().firstOrNull()
        }
    }
}
