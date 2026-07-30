package com.medicalsystem.backend.model

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test

class ReferralVisibilityPolicyTest {

    private fun createUser(role: UserRole, id: Long = 1L): User {
        return when (role) {
            UserRole.DOCTOR -> com.medicalsystem.backend.model.User(id = id, name = "Mock User", email = com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.DOCTOR)
            UserRole.TEACHER -> com.medicalsystem.backend.model.User(id = id, name = "Mock User", email = com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.TEACHER)
            UserRole.HEAD_COUNSELLOR -> com.medicalsystem.backend.model.User(id = id, name = "Mock User", email = com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.HEAD_COUNSELLOR)
            UserRole.TRIAL_ADMIN -> com.medicalsystem.backend.model.User(id = id, name = "Mock User", email = com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.TRIAL_ADMIN)
            UserRole.STUDENT -> com.medicalsystem.backend.model.User(id = id, name = "Mock User", email = com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.STUDENT)
            UserRole.SYSTEM_ADMIN -> com.medicalsystem.backend.model.User(id = id, name = "Mock User", email = com.medicalsystem.backend.model.EmailAddress("mock@univ.edu.cn"), role = com.medicalsystem.backend.model.UserRole.SYSTEM_ADMIN)
        }
    }

    @Test
    fun `teacher sees initiated referrals and referrals from allowed roles for assigned students`() {
        val user = createUser(UserRole.TEACHER, 100L)
        val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        
        assertEquals(VisibilityCriteria.ForTeacher(100L, listOf(UserRole.HEAD_COUNSELLOR)), criteria)
    }

    @Test
    fun `doctor sees only assigned referrals`() {
        val user = createUser(UserRole.DOCTOR, 200L)
        val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        
        assertEquals(VisibilityCriteria.ByAssignedDoctor(200L), criteria)
    }

    @Test
    fun `trial admin sees referrals that reached triage and beyond`() {
        val user = createUser(UserRole.TRIAL_ADMIN)
        val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        
        val expectedSteps = listOf(
            ReferralStepType.TRIAGE,
            ReferralStepType.SCHEDULING,
            ReferralStepType.EVALUATION,
            ReferralStepType.FEEDBACK
        )
        assertEquals(VisibilityCriteria.HasReachedStep(expectedSteps), criteria)
    }

    @Test
    fun `student sees referrals about them excluding drafts`() {
        val user = createUser(UserRole.STUDENT, 500L)
        val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        
        assertEquals(VisibilityCriteria.BySubject(500L, listOf(ReferralStatus.DRAFT, ReferralStatus.RECALLED)), criteria)
    }

    @Test
    fun `system admin sees all referrals`() {
        val user = createUser(UserRole.SYSTEM_ADMIN, 600L)
        val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        
        assertEquals(VisibilityCriteria.All, criteria)
    }

    @Test
    fun `head counsellor sees initiated referrals and awaiting approval`() {
        val user = createUser(UserRole.HEAD_COUNSELLOR, 300L)
        val criteria = ReferralVisibilityPolicy.getVisibilityCriteria(user)
        
        val expectedStatuses = listOf(
            ReferralStatus.AWAITING_APPROVAL,
            ReferralStatus.AWAITING_TRIAGE,
            ReferralStatus.WAITING_FOR_SCHEDULING,
            ReferralStatus.WAITING_FOR_APPOINTMENT,
            ReferralStatus.AWAITING_FEEDBACK_APPROVAL,
            ReferralStatus.CLOSED,
            ReferralStatus.REJECTED,
            ReferralStatus.RECALLED
        )
        assertEquals(VisibilityCriteria.InitiatedOrStatuses(300L, expectedStatuses), criteria)
    }
}
