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
                email = entity.email?.let { EmailAddress(it) },
                departmentId = entity.department.id,
                phone = entity.phone?.let { PhoneNumber(it) }
            )
            is TeacherEntity -> Teacher(
                id = entity.id,
                name = entity.name,
                email = entity.email?.let { EmailAddress(it) },
                collegeId = entity.college?.id
            )
            is HeadCounsellorEntity -> HeadCounsellor(
                id = entity.id,
                name = entity.name,
                email = entity.email?.let { EmailAddress(it) }
            )
            is TrialAdminEntity -> TrialAdmin(
                id = entity.id,
                name = entity.name,
                email = entity.email?.let { EmailAddress(it) }
            )
            else -> throw IllegalArgumentException("Unknown UserEntity type: ${entity.javaClass.simpleName}")
        }
    }

    fun toEntity(model: User): UserEntity {
        return when (model) {
            is Doctor -> DoctorEntity(
                id = model.id,
                name = model.name,
                email = model.email?.value,
                department = departmentRepository.findById(model.departmentId)
                    .orElseThrow { IllegalArgumentException("Department not found") },
                phone = model.phone?.value
            )
            is Teacher -> TeacherEntity(
                id = model.id,
                name = model.name,
                email = model.email?.value,
                college = model.collegeId?.let { 
                    collegeRepository.findById(it).orElse(null)
                }
            )
            is HeadCounsellor -> HeadCounsellorEntity(
                id = model.id,
                name = model.name,
                email = model.email?.value
            )
            is TrialAdmin -> TrialAdminEntity(
                id = model.id,
                name = model.name,
                email = model.email?.value
            )
            is StudentUser -> throw UnsupportedOperationException("StudentUser cannot be converted to UserEntity")
            is SystemAdmin -> throw UnsupportedOperationException("SystemAdmin cannot be converted to UserEntity")
        }
    }
}
