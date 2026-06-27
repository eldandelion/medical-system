package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "major_entity")
class MajorEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    var college: CollegeEntity
)
