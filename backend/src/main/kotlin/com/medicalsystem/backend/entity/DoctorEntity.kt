package com.medicalsystem.backend.entity

import jakarta.persistence.*

import com.medicalsystem.backend.model.UserRole

@Entity
@Table(name = "doctors")
@PrimaryKeyJoinColumn(name = "user_id")
class DoctorEntity(
    id: Long = 0,
    name: String,
    email: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false)
    var department: DepartmentEntity,

    @Column(length = 20)
    var phone: String? = null
) : UserEntity(id = id, name = name, role = UserRole.DOCTOR, email = email)
