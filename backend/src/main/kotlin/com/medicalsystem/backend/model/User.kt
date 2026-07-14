package com.medicalsystem.backend.model

sealed class User(
    open val id: Long,
    open val name: String,
    open val email: EmailAddress?,
    val role: UserRole
)

data class Doctor(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    val departmentId: Long,
    val phone: PhoneNumber?
) : User(id, name, email, UserRole.DOCTOR)

data class Teacher(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    val collegeId: Long?
) : User(id, name, email, UserRole.TEACHER)

data class HeadCounsellor(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?
) : User(id, name, email, UserRole.HEAD_COUNSELLOR)

data class TrialAdmin(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?
) : User(id, name, email, UserRole.TRIAL_ADMIN)

data class StudentUser(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?
) : User(id, name, email, UserRole.STUDENT)

data class SystemAdmin(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?
) : User(id, name, email, UserRole.SYSTEM_ADMIN)
