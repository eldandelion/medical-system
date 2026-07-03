package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

@Entity
@Table(name = "users")
@Inheritance(strategy = InheritanceType.JOINED)
abstract class UserEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    var role: UserRole,

    @Column(length = 100)
    var email: String? = null
)
