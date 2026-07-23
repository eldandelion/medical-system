package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.CollegeRepository
import com.medicalsystem.backend.repository.DepartmentRepository
import org.springframework.stereotype.Component

@Component
class UserMapper {
    fun toModel(entity: UserEntity): User {
        return when (entity) {
            is DoctorEntity -> Doctor(
                id = entity.id,
                name = entity.name,
                email = entity.email,
                departmentId = entity.department!!.id,
                phone = entity.phone?.let { PhoneNumber(it) }
            )
            is TeacherEntity -> Teacher(
                id = entity.id,
                name = entity.name,
                email = entity.email,
                collegeId = entity.college?.id
            )
            is HeadCounsellorEntity -> HeadCounsellor(
                id = entity.id,
                name = entity.name,
                email = entity.email
            )
            is TrialAdminEntity -> TrialAdmin(
                id = entity.id,
                name = entity.name,
                email = entity.email,
                hospitalId = entity.hospital?.id
            )
            is StudentUserEntity -> StudentUser(
                id = entity.id,
                name = entity.name,
                email = entity.email
            )
            else -> throw IllegalArgumentException("Unknown UserEntity type: ${entity.javaClass.simpleName}")
        }
    }

    fun toEntity(model: User): UserEntity {
        return when (model) {
            is Doctor -> DoctorEntity(
                id = model.id,
                name = model.name,
                email = model.email,
                phone = model.phone?.value
            )
            is Teacher -> TeacherEntity(
                id = model.id,
                name = model.name,
                email = model.email
            )
            is HeadCounsellor -> HeadCounsellorEntity(
                id = model.id,
                name = model.name,
                email = model.email
            )
            is TrialAdmin -> TrialAdminEntity(
                id = model.id,
                name = model.name,
                email = model.email
            )
            is StudentUser -> StudentUserEntity(
                id = model.id,
                name = model.name,
                email = model.email
            )
            is SystemAdmin -> throw UnsupportedOperationException("SystemAdmin cannot be converted to UserEntity")
        }
    }
}
