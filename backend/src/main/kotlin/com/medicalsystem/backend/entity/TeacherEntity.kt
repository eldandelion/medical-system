package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "teachers")
@PrimaryKeyJoinColumn(name = "user_id")
class TeacherEntity(
    id: Long = 0,
    name: String,
    email: EmailAddress,

    @Column(nullable = false)
    var employeeNumber: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id", nullable = false)
    var college: CollegeEntity

) : UserEntity(id = id, name = name, role = UserRole.TEACHER, email = email)
