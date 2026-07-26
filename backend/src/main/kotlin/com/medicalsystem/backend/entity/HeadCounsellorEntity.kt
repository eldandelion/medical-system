package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "head_counsellors")
class HeadCounsellorEntity(
    @Id
    @Column(name = "user_id")
    val userId: Long
)
