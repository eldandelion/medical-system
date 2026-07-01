package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "doctors")
class DoctorEntity(
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 50)
    var name: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    var department: DepartmentEntity,

    @Column(length = 20)
    var phone: String? = null
)
