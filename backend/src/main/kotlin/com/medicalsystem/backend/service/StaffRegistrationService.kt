package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.RegisterResponse
import com.medicalsystem.backend.dto.RegisterStaffRequest
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.event.DomainEventPublisher
import com.medicalsystem.backend.event.StaffRegisteredEvent
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate

@Service
class StaffRegistrationService(
    private val userJpaRepository: UserJpaRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val doctorRepository: DoctorRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val trialAdminJpaRepository: TrialAdminJpaRepository,
    private val collegeJpaRepository: CollegeJpaRepository,
    private val hospitalRepository: HospitalRepository,
    private val hospitalDepartmentRepository: HospitalDepartmentRepository,
    private val schoolJpaRepository: SchoolJpaRepository,
    private val schoolDepartmentJpaRepository: SchoolDepartmentJpaRepository,
    private val emailOtpService: EmailOtpService,
    private val domainEventPublisher: DomainEventPublisher
) {
    private val logger = LoggerFactory.getLogger(StaffRegistrationService::class.java)

    @Transactional
    fun registerStaff(request: RegisterStaffRequest): RegisterResponse {
        val trimmedEmail = request.email.trim().lowercase()
        val trimmedName = request.name.trim()
        val trimmedWorkerNo = request.workerNumber.trim()
        val trimmedIdCard = request.idCardNumber.trim().uppercase()

        // 1. Role validation
        if (request.role == UserRole.STUDENT) {
            throw ValidationException("STUDENT_REGISTRATION_NOT_ALLOWED")
        }

        // 2. Offline ID card validation
        if (!IdCardNumber.isValid(trimmedIdCard)) {
            throw ValidationException("INVALID_ID_CARD")
        }
        val idCard = IdCardNumber(trimmedIdCard)

        // 3. Demographic cross-step validation
        if (idCard.gender != request.gender) {
            throw ValidationException("ID_CARD_GENDER_MISMATCH")
        }

        try {
            val dob = LocalDate.parse(request.dateOfBirth)
            if (idCard.birthDate != dob) {
                throw ValidationException("ID_CARD_DOB_MISMATCH")
            }
        } catch (e: Exception) {
            if (e is ValidationException) throw e
            throw ValidationException("INVALID_DATE_OF_BIRTH")
        }

        // 4. Password validation
        val pwd = request.password
        if (pwd.length < 8 || !pwd.any { it.isLetter() } || !pwd.any { it.isDigit() }) {
            throw ValidationException("PASSWORD_REQUIREMENTS_NOT_MET")
        }

        // 5. Email OTP challenge validation
        emailOtpService.verifyAndConsume(trimmedEmail, request.emailOtp)

        // 6. Uniqueness checks
        val emailVo = EmailAddress(trimmedEmail)
        if (userJpaRepository.existsByEmail(emailVo)) {
            throw ConflictException("EMAIL_ALREADY_EXISTS")
        }

        checkWorkerNumberUnique(request.role, trimmedWorkerNo)

        // 7. Persist UserEntity with PENDING_APPROVAL status
        val userEntity = userJpaRepository.save(
            UserEntity(
                name = trimmedName,
                email = emailVo,
                role = request.role,
                status = AccountStatus.PENDING_APPROVAL
            )
        )

        // 8. Persist role-specific extension entity
        when (request.role) {
            UserRole.TEACHER -> {
                val college = resolveCollege(request.department ?: request.school)
                teacherJpaRepository.save(
                    TeacherEntity(
                        userId = userEntity.id,
                        employeeNumber = trimmedWorkerNo,
                        college = college
                    )
                )
            }
            UserRole.DOCTOR -> {
                val department = resolveHospitalDepartment(request.hospitalDepartment ?: request.department, request.hospital)
                doctorRepository.save(
                    DoctorEntity(
                        userId = userEntity.id,
                        employeeNumber = trimmedWorkerNo,
                        department = department
                    )
                )
            }
            UserRole.HEAD_COUNSELLOR -> {
                val (schoolId, deptId) = resolveSchoolAndDepartment(request.school, request.department)
                headCounsellorJpaRepository.save(
                    HeadCounsellorEntity(
                        userId = userEntity.id,
                        employeeNumber = trimmedWorkerNo,
                        schoolId = schoolId,
                        departmentId = deptId
                    )
                )
            }
            UserRole.TRIAL_ADMIN -> {
                val hospital = resolveHospital(request.hospital)
                trialAdminJpaRepository.save(
                    TrialAdminEntity(
                        userId = userEntity.id,
                        employeeNumber = trimmedWorkerNo,
                        hospital = hospital
                    )
                )
            }
            else -> {
                throw ValidationException("UNSUPPORTED_REGISTRATION_ROLE")
            }
        }

        // 9. Publish domain event
        domainEventPublisher.publish(
            StaffRegisteredEvent(
                userId = userEntity.id,
                role = userEntity.role,
                name = userEntity.name,
                email = userEntity.email,
                employeeNumber = trimmedWorkerNo,
                status = AccountStatus.PENDING_APPROVAL
            )
        )

        logger.info("Successfully registered staff user {} (role={}, id={}) awaiting admin approval", userEntity.email.value, userEntity.role, userEntity.id)

        return RegisterResponse(
            userId = userEntity.id,
            email = userEntity.email.value,
            name = userEntity.name,
            role = userEntity.role,
            status = AccountStatus.PENDING_APPROVAL
        )
    }

    private fun checkWorkerNumberUnique(role: UserRole, workerNumber: String) {
        val exists = when (role) {
            UserRole.TEACHER -> teacherJpaRepository.findByEmployeeNumber(workerNumber) != null
            UserRole.DOCTOR -> doctorRepository.findByEmployeeNumber(workerNumber) != null
            UserRole.HEAD_COUNSELLOR -> headCounsellorJpaRepository.findByEmployeeNumber(workerNumber) != null
            UserRole.TRIAL_ADMIN -> trialAdminJpaRepository.findByEmployeeNumber(workerNumber) != null
            else -> false
        }
        if (exists) {
            throw ConflictException("WORKER_NUMBER_ALREADY_EXISTS")
        }
    }

    private fun resolveCollege(name: String?): CollegeEntity {
        if (!name.isNullOrBlank()) {
            val existing = collegeJpaRepository.findByName(name.trim())
            if (existing != null) return existing
            return collegeJpaRepository.save(CollegeEntity(name = name.trim()))
        }
        return collegeJpaRepository.findAll().firstOrNull()
            ?: collegeJpaRepository.save(CollegeEntity(name = "通用学院"))
    }

    private fun resolveHospital(name: String?): HospitalEntity {
        if (!name.isNullOrBlank()) {
            val existing = hospitalRepository.findAll().firstOrNull { it.name.equals(name.trim(), ignoreCase = true) }
            if (existing != null) return existing
            return hospitalRepository.save(HospitalEntity(name = name.trim()))
        }
        return hospitalRepository.findAll().firstOrNull()
            ?: hospitalRepository.save(HospitalEntity(name = "中心医院"))
    }

    private fun resolveHospitalDepartment(deptName: String?, hospitalName: String?): HospitalDepartmentEntity {
        val hospital = resolveHospital(hospitalName)
        if (!deptName.isNullOrBlank()) {
            val existing = hospitalDepartmentRepository.findAll().firstOrNull {
                it.hospital.id == hospital.id && it.name.equals(deptName.trim(), ignoreCase = true)
            }
            if (existing != null) return existing
            return hospitalDepartmentRepository.save(HospitalDepartmentEntity(name = deptName.trim(), hospital = hospital))
        }
        return hospitalDepartmentRepository.findAll().firstOrNull { it.hospital.id == hospital.id }
            ?: hospitalDepartmentRepository.save(HospitalDepartmentEntity(name = "心理咨询科", hospital = hospital))
    }

    private fun resolveSchoolAndDepartment(schoolName: String?, deptName: String?): Pair<Long, Long> {
        val school = if (!schoolName.isNullOrBlank()) {
            val existing = schoolJpaRepository.findAll().firstOrNull { it.name.equals(schoolName.trim(), ignoreCase = true) }
            existing ?: schoolJpaRepository.save(SchoolEntity(name = schoolName.trim()))
        } else {
            schoolJpaRepository.findAll().firstOrNull() ?: schoolJpaRepository.save(SchoolEntity(name = "中南大学"))
        }

        val dept = if (!deptName.isNullOrBlank()) {
            val existing = schoolDepartmentJpaRepository.findAll().firstOrNull {
                it.school.id == school.id && it.name.equals(deptName.trim(), ignoreCase = true)
            }
            existing ?: schoolDepartmentJpaRepository.save(SchoolDepartmentEntity(name = deptName.trim(), school = school))
        } else {
            schoolDepartmentJpaRepository.findAll().firstOrNull { it.school.id == school.id }
                ?: schoolDepartmentJpaRepository.save(SchoolDepartmentEntity(name = "心理健康教育中心", school = school))
        }

        return Pair(school.id, dept.id)
    }
}
