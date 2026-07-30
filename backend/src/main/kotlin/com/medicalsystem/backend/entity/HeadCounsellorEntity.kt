package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "head_counsellors")
class HeadCounsellorEntity(
    @Id
    @Column(name = "user_id")
    val userId: Long,

    @Column(name = "employee_number", nullable = false, length = 50)
    var employeeNumber: String,

    @Column(name = "school_id", nullable = false)
    val schoolId: Long,

    @Column(name = "department_id", nullable = false)
    val departmentId: Long
)
