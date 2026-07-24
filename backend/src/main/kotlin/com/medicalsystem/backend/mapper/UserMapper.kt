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
                employeeNumber = HospitalEmployeeId(entity.employeeNumber),
                departmentId = entity.department!!.id,
                phone = entity.phone?.let { PhoneNumber(it) }
            )
            is TeacherEntity -> Teacher(
                id = entity.id,
                name = entity.name,
                email = entity.email,
                collegeId = entity.college.id!!,
                employeeNumber = SchoolEmployeeId(entity.employeeNumber)
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
                employeeNumber = HospitalEmployeeId(entity.employeeNumber),
                hospitalId = entity.hospital.id!!
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
                employeeNumber = model.employeeNumber.value,
                phone = model.phone?.value,
                department = DepartmentEntity(id = model.departmentId, name = "", hospital = HospitalEntity(id = 0, name = ""))
            )
            is Teacher -> TeacherEntity(
                id = model.id,
                name = model.name,
                email = model.email,
                employeeNumber = model.employeeNumber.value,
                college = CollegeEntity(id = model.collegeId, name = "")
            )
            is HeadCounsellor -> HeadCounsellorEntity(
                id = model.id,
                name = model.name,
                email = model.email
            )
            is TrialAdmin -> TrialAdminEntity(
                id = model.id,
                name = model.name,
                email = model.email,
                employeeNumber = model.employeeNumber.value,
                hospital = HospitalEntity(id = model.hospitalId, name = "")
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
