package com.medicalsystem.backend.model

sealed class StudentVisibilityCriteria {
    data class ByAssignedTeacher(val teacherId: Long) : StudentVisibilityCriteria()
    data class ByAssignedDoctor(val doctorId: Long) : StudentVisibilityCriteria()
    data class ByTrialAdmin(val adminId: Long) : StudentVisibilityCriteria()
    data class Self(val studentId: Long) : StudentVisibilityCriteria()
    object All : StudentVisibilityCriteria()
    object None : StudentVisibilityCriteria()
}

object StudentVisibilityPolicy {
    fun getVisibilityCriteria(user: User): StudentVisibilityCriteria {
        return when (user.role) {
            UserRole.SYSTEM_ADMIN, UserRole.HEAD_COUNSELLOR -> StudentVisibilityCriteria.All
            UserRole.TEACHER -> StudentVisibilityCriteria.ByAssignedTeacher(user.id)
            UserRole.DOCTOR -> StudentVisibilityCriteria.ByAssignedDoctor(user.id)
            UserRole.TRIAL_ADMIN -> StudentVisibilityCriteria.ByTrialAdmin(user.id)
            UserRole.STUDENT -> StudentVisibilityCriteria.Self(user.id)
        }
    }
}
