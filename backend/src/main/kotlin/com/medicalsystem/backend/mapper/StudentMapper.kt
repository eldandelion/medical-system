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
import com.medicalsystem.backend.model.Ethnicity
import com.medicalsystem.backend.model.School
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
                    ethnicity = it.ethnicity?.let { e -> Ethnicity(e.id ?: 0L, e.name) },
                    idCardNumber = it.idCardNumber?.let { num -> com.medicalsystem.backend.model.IdCardNumber(num) },
                    contactNumber = it.contactNumber?.let { num -> com.medicalsystem.backend.model.MobileNumber(num) },
                    email = it.email?.let { e -> com.medicalsystem.backend.model.EmailAddress(e) },
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone?.let { p -> com.medicalsystem.backend.model.PhoneNumber(p) },
                    school = it.school?.let { s -> School(s.id ?: 0L, s.name) }
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
                    ethnicity = it.ethnicity?.name,
                    idCardNumber = it.idCardNumber?.value,
                    contactNumber = it.contactNumber?.value,
                    email = it.email?.value,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone?.value,
                    school = it.school?.name
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
                    ethnicity = it.ethnicity?.name?.let { name -> ethnicityRepository.findByName(name).orElse(null) },
                    idCardNumber = it.idCardNumber?.value,
                    contactNumber = it.contactNumber?.value,
                    email = it.email?.value,
                    homeAddress = it.homeAddress,
                    emergencyContactName = it.emergencyContactName,
                    emergencyContactPhone = it.emergencyContactPhone?.value,
                    school = it.school?.name?.let { name -> schoolRepository.findByName(name).orElse(null) }
                )
            }
        )
    }
}
