package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "admins")
class AdminEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 50)
    var name: String,

    @Column(nullable = false, length = 50)
    var role: String
)
