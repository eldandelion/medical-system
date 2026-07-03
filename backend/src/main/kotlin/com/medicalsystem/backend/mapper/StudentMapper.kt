package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.dto.DemographicsDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.StudentDemographics
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.Demographics
import com.medicalsystem.backend.util.AcademicYearCalculator
import com.medicalsystem.backend.repository.EthnicityRepository
import com.medicalsystem.backend.repository.SchoolRepository
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.Period
import com.medicalsystem.backend.repository.StudentHealthProfileRepository

@Component
class StudentMapper(
    private val majorMapper: MajorMapper,
    private val academicYearCalculator: AcademicYearCalculator,
    private val ethnicityRepository: com.medicalsystem.backend.repository.EthnicityJpaRepository,
    private val schoolRepository: com.medicalsystem.backend.repository.SchoolJpaRepository,
    private val healthProfileRepository: StudentHealthProfileRepository
) {
    fun toModel(entity: StudentEntity): Student {
        val profile = healthProfileRepository.findByStudentId(entity.id).orElse(null)
        return Student(
            id = entity.id,
            studentNumber = entity.studentNumber,
            name = entity.name,
            major = majorMapper.toModel(entity.major),
            enrollmentDate = entity.enrollmentDate,
            riskStatus = profile?.riskStatus ?: com.medicalsystem.backend.model.RiskStatus.LOW,
            demographics = entity.demographics?.let {
                Demographics(
                    gender = it.gender,
                    dateOfBirth = it.dateOfBirth,
                    ethnicity = it.ethnicity?.name,
                    idCardNumber = it.idCardNumber,
                    contactNumber = it.contactNumber,
                    email = it.email,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone,
                    school = it.school?.name
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
                    gender = it.gender?.name,
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
            demographics = model.demographics?.let {
                StudentDemographics(
                    gender = it.gender,
                    dateOfBirth = it.dateOfBirth,
                    ethnicity = it.ethnicity?.let { name -> ethnicityRepository.findByName(name).orElse(null) },
                    idCardNumber = it.idCardNumber,
                    contactNumber = it.contactNumber,
                    email = it.email,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone,
                    school = it.school?.let { name -> schoolRepository.findByName(name).orElse(null) }
                )
            }
        )
    }
}
