package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "student_users")
@PrimaryKeyJoinColumn(name = "user_id")
class StudentUserEntity(
    id: Long = 0,
    name: String,
    email: EmailAddress
) : UserEntity(id = id, name = name, role = UserRole.STUDENT, email = email)
