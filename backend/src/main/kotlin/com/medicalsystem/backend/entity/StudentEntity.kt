package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "students")
class StudentEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false)
    val studentNumber: String,

    @Column(nullable = false)
    val name: String,

    @Column(nullable = false)
    val major: String,

    @Column(nullable = false)
    val year: String,

    @Column(nullable = false)
    val status: String
)
