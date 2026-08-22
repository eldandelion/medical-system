package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.UserRole

data class UserProfileDto(
    val id: Long,
    val name: String,
    val role: UserRole,
    val email: String,
    val avatarInitial: String? = null,
    val avatarBg: String? = null,
    val passwordLastChanged: String? = null,
    val studentProfile: StudentProfileDetailsDto? = null,
    val staffProfile: StaffProfileDetailsDto? = null
)

data class StudentProfileDetailsDto(
    val studentNumber: String,
    val school: String? = null,
    val major: String? = null,
    val academicYear: String? = null,
    val gender: Gender? = null,
    val birthday: String? = null,
    val ethnicity: String? = null,
    val idCardNumber: String? = null,
    val contactNumber: String? = null,
    val homeAddress: String? = null,
    val emergencyContactName: String? = null,
    val emergencyContactPhone: String? = null,
    val emergencyContactRelation: String? = null
)

data class StaffProfileDetailsDto(
    val employeeNumber: String,
    val organization: String? = null,
    val department: String? = null,
    val title: String? = null,
    val contactNumber: String? = null
)

data class UpdateUserProfileRequest(
    val name: String? = null,
    val email: String? = null,
    val avatarInitial: String? = null,
    val avatarBg: String? = null,
    val gender: Gender? = null,
    val birthday: String? = null,
    val ethnicity: String? = null,
    val idCardNumber: String? = null,
    val contactNumber: String? = null,
    val homeAddress: String? = null,
    val emergencyContactName: String? = null,
    val emergencyContactPhone: String? = null,
    val emergencyContactRelation: String? = null
)
