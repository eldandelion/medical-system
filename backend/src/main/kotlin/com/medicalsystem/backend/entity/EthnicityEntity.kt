package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "ethnicities")
class EthnicityEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(unique = true, nullable = false, length = 50)
    var name: String
)
