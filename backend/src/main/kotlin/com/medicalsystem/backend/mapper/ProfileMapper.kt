package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.model.*
import org.springframework.stereotype.Component

@Component
class ProfileMapper {

    fun toDoctor(entity: DoctorEntity): Doctor {
        return Doctor(
            userId = entity.userId,
            employeeNumber = HospitalEmployeeId(entity.employeeNumber),
            departmentId = entity.department!!.id,
            phone = entity.phone?.let { PhoneNumber(it) }
        )
    }

    fun toDoctorEntity(profile: Doctor): DoctorEntity {
        return DoctorEntity(
            userId = profile.userId,
            employeeNumber = profile.employeeNumber.value,
            phone = profile.phone?.value,
            department = HospitalDepartmentEntity(id = profile.departmentId, name = "", hospital = HospitalEntity(id = 0, name = ""))
        )
    }

    fun toTeacher(entity: TeacherEntity): Teacher {
        return Teacher(
            userId = entity.userId,
            employeeNumber = SchoolEmployeeId(entity.employeeNumber),
            collegeId = entity.college.id!!
        )
    }

    fun toTeacherEntity(profile: Teacher): TeacherEntity {
        return TeacherEntity(
            userId = profile.userId,
            employeeNumber = profile.employeeNumber.value,
            college = CollegeEntity(id = profile.collegeId, name = "")
        )
    }

    fun toHeadCounsellor(entity: HeadCounsellorEntity): HeadCounsellor {
        return HeadCounsellor(
            userId = entity.userId
        )
    }

    fun toHeadCounsellorEntity(profile: HeadCounsellor): HeadCounsellorEntity {
        return HeadCounsellorEntity(
            userId = profile.userId
        )
    }

    fun toTrialAdmin(entity: TrialAdminEntity): TrialAdmin {
        return TrialAdmin(
            userId = entity.userId,
            employeeNumber = HospitalEmployeeId(entity.employeeNumber),
            hospitalId = entity.hospital.id!!
        )
    }

    fun toTrialAdminEntity(profile: TrialAdmin): TrialAdminEntity {
        return TrialAdminEntity(
            userId = profile.userId,
            employeeNumber = profile.employeeNumber.value,
            hospital = HospitalEntity(id = profile.hospitalId, name = "")
        )
    }


}
