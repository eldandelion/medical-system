package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.CollegeRepository
import com.medicalsystem.backend.repository.DepartmentRepository
import org.springframework.stereotype.Component

@Component
class UserMapper(
    private val collegeRepository: com.medicalsystem.backend.repository.CollegeJpaRepository,
    private val departmentRepository: com.medicalsystem.backend.repository.DepartmentRepository
) {
    fun toModel(entity: UserEntity): User {
        return when (entity) {
            is DoctorEntity -> Doctor(
                id = entity.id,
                name = entity.name,
                email = entity.email,
                departmentId = entity.department.id,
                phone = entity.phone
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
                department = departmentRepository.findById(model.departmentId)
                    .orElseThrow { IllegalArgumentException("Department not found") },
                phone = model.phone
            )
            is Teacher -> TeacherEntity(
                id = model.id,
                name = model.name,
                email = model.email,
                college = model.collegeId?.let { 
                    collegeRepository.findById(it).orElse(null)
                }
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
            is StudentUser -> throw UnsupportedOperationException("StudentUser cannot be converted to UserEntity")
            is SystemAdmin -> throw UnsupportedOperationException("SystemAdmin cannot be converted to UserEntity")
        }
    }
}
