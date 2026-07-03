package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

@Entity
@Table(name = "teachers")
@PrimaryKeyJoinColumn(name = "user_id")
class TeacherEntity(
    id: Long = 0,
    name: String,
    email: String? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "college_id")
    var college: CollegeEntity? = null

) : UserEntity(id = id, name = name, role = UserRole.TEACHER, email = email)
