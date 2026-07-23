package com.medicalsystem.backend.model

import java.net.URI

sealed class User(
    open val id: Long,
    open val name: String,
    open val email: EmailAddress?,
    open val avatarUrl: URI? = null,
    val role: UserRole
)

data class Doctor(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    override val avatarUrl: URI? = null,
    val departmentId: Long,
    val phone: PhoneNumber?
) : User(id, name, email, avatarUrl, UserRole.DOCTOR)

data class Teacher(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    override val avatarUrl: URI? = null,
    val collegeId: Long?
) : User(id, name, email, avatarUrl, UserRole.TEACHER)

data class HeadCounsellor(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    override val avatarUrl: URI? = null
) : User(id, name, email, avatarUrl, UserRole.HEAD_COUNSELLOR)

data class TrialAdmin(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    override val avatarUrl: URI? = null,
    val hospitalId: Long? = null
) : User(id, name, email, avatarUrl, UserRole.TRIAL_ADMIN)

data class StudentUser(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    override val avatarUrl: URI? = null
) : User(id, name, email, avatarUrl, UserRole.STUDENT)

data class SystemAdmin(
    override val id: Long,
    override val name: String,
    override val email: EmailAddress?,
    override val avatarUrl: URI? = null
) : User(id, name, email, avatarUrl, UserRole.SYSTEM_ADMIN)
