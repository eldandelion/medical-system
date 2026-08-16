package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import java.net.URI

class StudentVisibilityPolicyTest {

    private fun createUser(id: Long, role: UserRole): User {
        return User(
            id = id,
            name = "Test User",
            email = EmailAddress("test@example.com"),
            avatarUrl = URI.create("http://example.com/avatar"),
            role = role
        )
    }

    @Test
    fun `teacher gets ByAssignedTeacher criteria`() {
        val user = createUser(100L, UserRole.TEACHER)
        val criteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        
        assertTrue(criteria is StudentVisibilityCriteria.ByAssignedTeacher)
        assertEquals(100L, (criteria as StudentVisibilityCriteria.ByAssignedTeacher).teacherId)
    }

    @Test
    fun `student gets Self criteria`() {
        val user = createUser(200L, UserRole.STUDENT)
        val criteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        
        assertTrue(criteria is StudentVisibilityCriteria.Self)
        assertEquals(200L, (criteria as StudentVisibilityCriteria.Self).studentId)
    }

    @Test
    fun `system admin gets All criteria`() {
        val user = createUser(300L, UserRole.SYSTEM_ADMIN)
        val criteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        
        assertTrue(criteria is StudentVisibilityCriteria.All)
    }

    @Test
    fun `head counsellor gets All criteria`() {
        val user = createUser(400L, UserRole.HEAD_COUNSELLOR)
        val criteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        
        assertTrue(criteria is StudentVisibilityCriteria.All)
    }

    @Test
    fun `doctor gets ByAssignedDoctor criteria`() {
        val user = createUser(500L, UserRole.DOCTOR)
        val criteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        
        assertTrue(criteria is StudentVisibilityCriteria.ByAssignedDoctor)
        assertEquals(500L, (criteria as StudentVisibilityCriteria.ByAssignedDoctor).doctorId)
    }

    @Test
    fun `trial admin gets ByTrialAdmin criteria`() {
        val user = createUser(600L, UserRole.TRIAL_ADMIN)
        val criteria = StudentVisibilityPolicy.getVisibilityCriteria(user)
        
        assertTrue(criteria is StudentVisibilityCriteria.ByTrialAdmin)
        assertEquals(600L, (criteria as StudentVisibilityCriteria.ByTrialAdmin).adminId)
    }
}
