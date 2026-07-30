package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "users")
class UserEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(nullable = false)
    var role: UserRole,

    @Column(length = 100, nullable = false, unique = true)
    var email: EmailAddress
)
