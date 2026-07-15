package com.medicalsystem.backend.entity

import jakarta.persistence.*
import com.medicalsystem.backend.model.UserRole

@Entity
@Table(name = "trial_admins")
@PrimaryKeyJoinColumn(name = "user_id")
class TrialAdminEntity(
    id: Long = 0,
    name: String,
    email: String? = null,
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "hospital_id", unique = true)
    var hospital: HospitalEntity? = null
) : UserEntity(id = id, name = name, role = UserRole.TRIAL_ADMIN, email = email)
