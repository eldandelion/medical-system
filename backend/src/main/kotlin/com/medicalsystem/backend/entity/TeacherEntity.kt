package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "teachers")
class TeacherEntity(
    @Id
    @Column(name = "user_id")
    val userId: Long,

    @Column(nullable = false)
    var employeeNumber: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    var college: CollegeEntity
)
