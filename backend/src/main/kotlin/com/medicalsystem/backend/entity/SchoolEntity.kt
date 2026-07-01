package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "schools")
class SchoolEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false, length = 100)
    var name: String
)
