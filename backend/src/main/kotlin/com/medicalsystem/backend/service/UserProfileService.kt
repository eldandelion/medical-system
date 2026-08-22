package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.entity.EthnicityEntity
import com.medicalsystem.backend.entity.StudentDemographicsEntity
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.format.DateTimeFormatter

@Service
class UserProfileService(
    private val userJpaRepository: UserJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val doctorRepository: DoctorRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val trialAdminJpaRepository: TrialAdminJpaRepository,
    private val ethnicityJpaRepository: EthnicityJpaRepository,
    private val schoolJpaRepository: SchoolJpaRepository
) {

    private val dateFormatter = DateTimeFormatter.ofPattern("yyyy年M月d日")

    @Transactional(readOnly = true)
    fun getProfile(user: User): UserProfileDto {
        val userEntity = userJpaRepository.findById(user.id)
            .orElseThrow { NotFoundException("User not found: ${user.id}") }

        val studentProfile = if (user.role == UserRole.STUDENT) {
            val studentEntity = studentJpaRepository.findById(user.id).orElse(null)
            studentEntity?.let { s ->
                val demographics = s.demographics
                val birthdayStr = demographics?.dateOfBirth?.let {
                    try { it.format(dateFormatter) } catch (e: Exception) { it.toString() }
                }
                val schoolName = demographics?.school?.name ?: s.major.college.name
                StudentProfileDetailsDto(
                    studentNumber = s.studentNumber,
                    school = schoolName,
                    major = s.major.name,
                    academicYear = "${s.enrollmentDate.year}级",
                    gender = demographics?.gender,
                    birthday = birthdayStr,
                    ethnicity = demographics?.ethnicity?.name,
                    idCardNumber = demographics?.idCardNumber,
                    contactNumber = demographics?.contactNumber,
                    homeAddress = demographics?.homeAddress,
                    emergencyContactName = demographics?.emergencyContactName,
                    emergencyContactPhone = demographics?.emergencyContactPhone,
                    emergencyContactRelation = null
                )
            }
        } else null

        val staffProfile = when (user.role) {
            UserRole.TEACHER -> {
                val teacherEntity = teacherJpaRepository.findById(user.id).orElse(null)
                StaffProfileDetailsDto(
                    employeeNumber = teacherEntity?.employeeNumber ?: "TEA-${user.id}",
                    organization = teacherEntity?.college?.name ?: "所属学院",
                    department = teacherEntity?.college?.name,
                    title = "专任教师 / 班导师"
                )
            }
            UserRole.DOCTOR -> {
                val doctorEntity = doctorRepository.findById(user.id).orElse(null)
                StaffProfileDetailsDto(
                    employeeNumber = doctorEntity?.employeeNumber ?: "DOC-${user.id}",
                    organization = doctorEntity?.department?.hospital?.name ?: "定点合作医院",
                    department = doctorEntity?.department?.name ?: "精神心理科",
                    title = "主治医师",
                    contactNumber = doctorEntity?.phone
                )
            }
            UserRole.HEAD_COUNSELLOR -> {
                val hcEntity = headCounsellorJpaRepository.findById(user.id).orElse(null)
                val schoolName = hcEntity?.schoolId?.let { schoolJpaRepository.findById(it).orElse(null)?.name }
                StaffProfileDetailsDto(
                    employeeNumber = hcEntity?.employeeNumber ?: "HC-${user.id}",
                    organization = schoolName ?: "心理健康教育中心",
                    department = "学生心理危机干预中心",
                    title = "心理中心主管"
                )
            }
            UserRole.TRIAL_ADMIN -> {
                val taEntity = trialAdminJpaRepository.findById(user.id).orElse(null)
                StaffProfileDetailsDto(
                    employeeNumber = taEntity?.employeeNumber ?: "ADM-${user.id}",
                    organization = "临床科研与试验中心",
                    department = "科研管理办公室",
                    title = "试验项目管理员"
                )
            }
            UserRole.SYSTEM_ADMIN -> {
                StaffProfileDetailsDto(
                    employeeNumber = "SYS-${user.id}",
                    organization = "信息化建设与管理处",
                    department = "系统治理与安全管理部",
                    title = "超级管理员"
                )
            }
            UserRole.STUDENT -> null
        }

        val avatarInitial = userEntity.name.firstOrNull()?.toString() ?: "U"

        return UserProfileDto(
            id = userEntity.id,
            name = userEntity.name,
            role = userEntity.role,
            email = userEntity.email.value,
            avatarInitial = avatarInitial,
            avatarBg = "#E47035",
            passwordLastChanged = "已设置并受保护",
            studentProfile = studentProfile,
            staffProfile = staffProfile
        )
    }

    @Transactional
    fun updateProfile(user: User, request: UpdateUserProfileRequest): UserProfileDto {
        val userEntity = userJpaRepository.findById(user.id)
            .orElseThrow { NotFoundException("User not found: ${user.id}") }

        request.name?.trim()?.takeIf { it.isNotEmpty() }?.let {
            userEntity.name = it
        }

        request.email?.trim()?.takeIf { it.isNotEmpty() }?.let {
            try {
                userEntity.email = EmailAddress(it)
            } catch (e: IllegalArgumentException) {
                // Ignore invalid email format or keep existing
            }
        }

        if (user.role == UserRole.STUDENT) {
            val studentEntity = studentJpaRepository.findById(user.id).orElse(null)
            if (studentEntity != null) {
                studentEntity.name = userEntity.name
                if (studentEntity.demographics == null) {
                    studentEntity.demographics = StudentDemographicsEntity()
                }
                val demo = studentEntity.demographics!!

                request.gender?.let { demo.gender = it }
                request.birthday?.let { demo.dateOfBirth = parseDateOfBirth(it) }
                request.ethnicity?.trim()?.takeIf { it.isNotEmpty() }?.let { ethName ->
                    val ethOpt = ethnicityJpaRepository.findByName(ethName)
                    demo.ethnicity = if (ethOpt.isPresent) {
                        ethOpt.get()
                    } else {
                        try {
                            ethnicityJpaRepository.save(EthnicityEntity(name = ethName))
                        } catch (e: Exception) {
                            ethnicityJpaRepository.findAll().firstOrNull()
                        }
                    }
                }

                request.idCardNumber?.let { demo.idCardNumber = it }
                request.contactNumber?.let { demo.contactNumber = it }
                request.email?.let { demo.email = it }
                request.homeAddress?.let { demo.homeAddress = it }
                request.emergencyContactName?.let { demo.emergencyContactName = it }
                request.emergencyContactPhone?.let { demo.emergencyContactPhone = it }

                studentJpaRepository.save(studentEntity)
            }
        }

        userJpaRepository.save(userEntity)
        return getProfile(user)
    }

    private fun parseDateOfBirth(dateStr: String?): LocalDate? {
        if (dateStr.isNullOrBlank()) return null
        return try {
            LocalDate.parse(dateStr)
        } catch (e: Exception) {
            try {
                LocalDate.parse(dateStr, dateFormatter)
            } catch (e2: Exception) {
                null
            }
        }
    }
}
