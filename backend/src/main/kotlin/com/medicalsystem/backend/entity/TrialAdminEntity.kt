package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.model.EmailAddress

@Entity
@Table(name = "trial_admins")
@PrimaryKeyJoinColumn(name = "user_id")
class TrialAdminEntity(
    id: Long = 0,
    name: String,
    email: EmailAddress,
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", unique = true)
    var hospital: HospitalEntity? = null
) : UserEntity(id = id, name = name, role = UserRole.TRIAL_ADMIN, email = email)
