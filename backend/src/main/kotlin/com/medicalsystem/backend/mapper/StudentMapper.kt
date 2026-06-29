package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.dto.DemographicsDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.StudentDemographics
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.Demographics
import com.medicalsystem.backend.util.AcademicYearCalculator
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.Period

@Component
class StudentMapper(
    private val majorMapper: MajorMapper,
    private val academicYearCalculator: AcademicYearCalculator
) {
    fun toModel(entity: StudentEntity): Student {
        return Student(
            id = entity.id,
            studentNumber = entity.studentNumber,
            name = entity.name,
            major = majorMapper.toModel(entity.major),
            enrollmentDate = entity.enrollmentDate,
            riskStatus = entity.riskStatus,
            demographics = entity.demographics?.let {
                Demographics(
                    gender = it.gender,
                    dateOfBirth = it.dateOfBirth,
                    ethnicity = it.ethnicity,
                    idCardNumber = it.idCardNumber,
                    contactNumber = it.contactNumber,
                    email = it.email,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone,
                    school = it.school
                )
            }
        )
    }

    fun toDto(model: Student): StudentDto {
        return StudentDto(
            id = model.id.toString(),
            studentNumber = model.studentNumber,
            name = model.name,
            majorId = model.major.id,
            major = model.major.name,
            enrollmentDate = model.enrollmentDate,
            year = academicYearCalculator.calculate(model.enrollmentDate),
            riskLevel = model.riskStatus,
            status = "Active",
            demographics = model.demographics?.let {
                DemographicsDto(
                    gender = it.gender,
                    age = it.dateOfBirth?.let { dob -> Period.between(dob, LocalDate.now()).years },
                    ethnicity = it.ethnicity,
                    idCardNumber = it.idCardNumber,
                    contactNumber = it.contactNumber,
                    email = it.email,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone,
                    school = it.school
                )
            }
        )
    }

    fun toEntity(model: Student): StudentEntity {
        return StudentEntity(
            id = model.id,
            studentNumber = model.studentNumber,
            name = model.name,
            major = majorMapper.toEntity(model.major),
            enrollmentDate = model.enrollmentDate,
            riskStatus = model.riskStatus,
            demographics = model.demographics?.let {
                StudentDemographics(
                    gender = it.gender,
                    dateOfBirth = it.dateOfBirth,
                    ethnicity = it.ethnicity,
                    idCardNumber = it.idCardNumber,
                    contactNumber = it.contactNumber,
                    email = it.email,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone,
                    school = it.school
                )
            }
        )
    }
}
