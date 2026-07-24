package com.medicalsystem.backend.entity

import jakarta.persistence.*

import com.medicalsystem.backend.model.UserRole

import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "doctors")
@PrimaryKeyJoinColumn(name = "user_id")
class DoctorEntity(
    id: Long = 0,
    name: String,
    email: EmailAddress,

    @Column(name = "employee_number", length = 50, nullable = false)
    var employeeNumber: String,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    var department: DepartmentEntity? = null,

    @Column(length = 20)
    var phone: String? = null

) : UserEntity(id = id, name = name, role = UserRole.DOCTOR, email = email)
