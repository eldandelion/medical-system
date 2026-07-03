package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

@Entity
@Table(name = "head_counsellors")
@PrimaryKeyJoinColumn(name = "user_id")
class HeadCounsellorEntity(
    id: Long = 0,
    name: String,
    email: String? = null
) : UserEntity(id = id, name = name, role = UserRole.HEAD_COUNSELLOR, email = email)
