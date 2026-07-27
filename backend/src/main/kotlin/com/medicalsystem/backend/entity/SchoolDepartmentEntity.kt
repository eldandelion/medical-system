package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "school_departments")
class SchoolDepartmentEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    var school: SchoolEntity
)
