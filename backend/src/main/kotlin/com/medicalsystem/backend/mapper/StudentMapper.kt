package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.StudentDto
import com.medicalsystem.backend.dto.DemographicsDto
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.Demographics
import com.medicalsystem.backend.model.DegreeLevel
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
    private val degreeLevelRepository: com.medicalsystem.backend.repository.DegreeLevelJpaRepository,
    private val ethnicityRepository: com.medicalsystem.backend.repository.EthnicityJpaRepository,
    private val schoolRepository: com.medicalsystem.backend.repository.SchoolJpaRepository,
    private val healthProfileRepository: StudentHealthProfileRepository,
    private val teacherRepository: com.medicalsystem.backend.repository.TeacherRepository,
    private val riskEvaluator: com.medicalsystem.backend.service.StudentRiskEvaluator
) {
    fun toModel(entity: StudentEntity): Student {
        val profile = healthProfileRepository.findByStudentId(entity.id).orElse(null)
        return Student(
            id = entity.id,
            studentNumber = entity.studentNumber,
            name = entity.name,
            major = majorMapper.toModel(entity.major),
            enrollmentDate = entity.enrollmentDate,
            riskStatus = profile?.evaluateRisk(riskEvaluator) ?: com.medicalsystem.backend.model.RiskStatus.LOW,
            degreeLevel = entity.degreeLevel?.let { d -> DegreeLevel(d.id, d.name) },
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
            },
            assignedTeacherId = entity.assignedTeacher?.userId
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
            degreeLevel = model.degreeLevel?.name,
            degreeLevelId = model.degreeLevel?.id,
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
            degreeLevel = model.degreeLevel?.name?.let { name -> degreeLevelRepository.findByName(name).orElse(null) },
            demographics = model.demographics?.let {
                StudentDemographicsEntity(
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
            },
            assignedTeacher = model.assignedTeacherId?.let { id -> teacherRepository.findById(id).orElse(null) }
        )
    }
}
