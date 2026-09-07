package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.AdminUserDetailsDto
import com.medicalsystem.backend.dto.DemographicsDto
import com.medicalsystem.backend.dto.UserAffiliationDto
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Component
import java.time.LocalDate
import java.time.Period

@Component
class UserDetailAssembler(
    private val studentJpaRepository: StudentJpaRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val doctorRepository: DoctorRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val trialAdminJpaRepository: TrialAdminJpaRepository,
    private val schoolJpaRepository: SchoolJpaRepository
) {
    fun assemble(user: UserEntity): AdminUserDetailsDto {
        var affiliation = UserAffiliationDto()
        var demographics: DemographicsDto? = null
        var contactNumber: String? = null
        var homeAddress: String? = null

        when (user.role) {
            UserRole.STUDENT -> {
                studentJpaRepository.findById(user.id).ifPresent { student ->
                    val demo = student.demographics
                    affiliation = UserAffiliationDto(
                        identifier = student.studentNumber,
                        primaryOrganization = demo?.school?.name ?: student.major.college.name,
                        departmentOrMajor = "${student.major.college.name} / ${student.major.name}",
                        titleOrDegree = student.degreeLevel?.name,
                        enrollmentYear = student.enrollmentDate.year
                    )
                    if (demo != null) {
                        val calculatedAge = demo.dateOfBirth?.let { Period.between(it, LocalDate.now()).years }
                        demographics = DemographicsDto(
                            gender = demo.gender?.name,
                            age = calculatedAge,
                            ethnicity = demo.ethnicity?.name,
                            idCardNumber = demo.idCardNumber,
                            contactNumber = demo.contactNumber,
                            email = demo.email ?: user.email.value,
                            homeAddress = demo.homeAddress,
                            emergencyContactName = demo.emergencyContactName,
                            emergencyContactPhone = demo.emergencyContactPhone,
                            school = demo.school?.name ?: student.major.college.name
                        )
                        contactNumber = demo.contactNumber
                        homeAddress = demo.homeAddress
                    }
                }
            }
            UserRole.TEACHER -> {
                teacherJpaRepository.findById(user.id).ifPresent { teacher ->
                    affiliation = UserAffiliationDto(
                        identifier = teacher.employeeNumber,
                        primaryOrganization = teacher.college.name,
                        departmentOrMajor = teacher.college.name,
                        titleOrDegree = "TEACHER"
                    )
                }
            }
            UserRole.DOCTOR -> {
                doctorRepository.findById(user.id).ifPresent { doctor ->
                    affiliation = UserAffiliationDto(
                        identifier = doctor.employeeNumber,
                        primaryOrganization = doctor.department?.hospital?.name,
                        departmentOrMajor = doctor.department?.name,
                        titleOrDegree = "DOCTOR"
                    )
                    contactNumber = doctor.phone
                }
            }
            UserRole.HEAD_COUNSELLOR -> {
                headCounsellorJpaRepository.findById(user.id).ifPresent { hc ->
                    val schoolName = schoolJpaRepository.findById(hc.schoolId).orElse(null)?.name
                    affiliation = UserAffiliationDto(
                        identifier = hc.employeeNumber,
                        primaryOrganization = schoolName,
                        departmentOrMajor = "COUNSELING_CENTER",
                        titleOrDegree = "HEAD_COUNSELLOR"
                    )
                }
            }
            UserRole.TRIAL_ADMIN -> {
                trialAdminJpaRepository.findById(user.id).ifPresent { ta ->
                    affiliation = UserAffiliationDto(
                        identifier = ta.employeeNumber,
                        primaryOrganization = ta.hospital.name,
                        departmentOrMajor = "TRIAL_OFFICE",
                        titleOrDegree = "TRIAL_ADMIN"
                    )
                }
            }
            UserRole.SYSTEM_ADMIN -> {
                affiliation = UserAffiliationDto(
                    identifier = "SYS-ADMIN",
                    primaryOrganization = "GLOBAL_SYSTEM",
                    departmentOrMajor = "ADMIN_DEPARTMENT",
                    titleOrDegree = "SYSTEM_ADMIN"
                )
            }
        }

        return AdminUserDetailsDto(
            id = user.id,
            name = user.name,
            email = user.email.value,
            role = user.role,
            status = user.status,
            employeeOrStudentId = affiliation.identifier,
            departmentOrCollege = affiliation.departmentOrMajor,
            hospital = if (user.role == UserRole.DOCTOR || user.role == UserRole.TRIAL_ADMIN) affiliation.primaryOrganization else null,
            deletedAt = user.deletedAt,
            affiliation = affiliation,
            demographics = demographics,
            contactNumber = contactNumber,
            homeAddress = homeAddress
        )
    }
}
