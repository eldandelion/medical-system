package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.exception.ConflictException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.exception.UnauthorizedException
import com.medicalsystem.backend.exception.ValidationException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import com.medicalsystem.backend.security.JwtService
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDate
import java.time.LocalDateTime

@Service
class AuthService(
    private val userJpaRepository: UserJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val majorJpaRepository: MajorJpaRepository,
    private val collegeJpaRepository: CollegeJpaRepository,
    private val studentHealthProfileJpaRepository: StudentHealthProfileJpaRepository,
    private val assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository,
    private val otpService: OtpService,
    private val jwtService: JwtService,
    private val passwordEncoder: PasswordEncoder = BCryptPasswordEncoder(),
    private val teacherJpaRepository: TeacherJpaRepository? = null,
    private val doctorRepository: DoctorRepository? = null,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository? = null,
    private val trialAdminJpaRepository: TrialAdminJpaRepository? = null
) {

    @Transactional
    fun registerStudent(request: StudentRegisterRequest): AuthResponse {
        val studentNumber = request.studentNumber.trim()
        val phone = request.phone.trim()

        if (studentJpaRepository.existsByStudentNumber(studentNumber)) {
            throw ConflictException("学号已被注册: $studentNumber")
        }
        if (userJpaRepository.existsByPhone(phone)) {
            throw ConflictException("手机号码已被注册: $phone")
        }

        otpService.verifyOtp(
            phone = MobileNumber(phone),
            code = request.verificationCode,
            purpose = OtpPurpose.REGISTRATION,
            consume = true
        )

        var emailStr = "$studentNumber@univ.edu.cn"
        if (userJpaRepository.existsByEmail(EmailAddress(emailStr))) {
            emailStr = "$studentNumber.${System.currentTimeMillis()}@univ.edu.cn"
        }

        val userEntity = UserEntity(
            name = request.fullName.trim(),
            role = UserRole.STUDENT,
            email = EmailAddress(emailStr),
            status = AccountStatus.ACTIVE,
            phone = phone,
            passwordHash = passwordEncoder.encode(request.password)
        )
        val savedUser = userJpaRepository.save(userEntity)

        var defaultMajor = majorJpaRepository.findAll().firstOrNull()
        if (defaultMajor == null) {
            var defaultCollege = collegeJpaRepository.findAll().firstOrNull()
            if (defaultCollege == null) {
                defaultCollege = collegeJpaRepository.save(CollegeEntity(name = "综合学院"))
            }
            defaultMajor = majorJpaRepository.save(MajorEntity(name = "通用专业", college = defaultCollege))
        }

        val studentEntity = StudentEntity(
            id = savedUser.id,
            studentNumber = studentNumber,
            name = request.fullName.trim(),
            major = defaultMajor,
            enrollmentDate = LocalDate.now()
        )
        val savedStudent = studentJpaRepository.save(studentEntity)

        val healthProfile = StudentHealthProfileEntity(
            studentId = savedUser.id,
            riskStatus = RiskStatus.LOW
        )
        studentHealthProfileJpaRepository.save(healthProfile)

        val initialAssignment = AssessmentAssignmentEntity(
            student = savedStudent,
            assignedByUser = savedUser,
            batteryCode = "comprehensive_student_intake_survey",
            status = AssessmentStatus.PENDING,
            assignedAt = LocalDateTime.now()
        )
        assessmentAssignmentJpaRepository.save(initialAssignment)

        val token = jwtService.generateToken(
            userId = savedUser.id,
            studentNumber = studentNumber,
            role = "STUDENT"
        )

        return AuthResponse(
            token = token,
            student = StudentAuthDto(
                studentNumber = studentNumber,
                fullName = savedUser.name,
                phone = phone,
                createdAt = LocalDateTime.now()
            ),
            userId = savedUser.id,
            role = savedUser.role,
            email = savedUser.email.value,
            name = savedUser.name
        )
    }

    @Transactional(readOnly = true)
    fun checkAvailability(studentNumber: String?, phone: String?): CheckAvailabilityResponse {
        var studentNumberAvailable = true
        var phoneAvailable = true

        if (!studentNumber.isNullOrBlank()) {
            val cleanNum = studentNumber.trim()
            if (studentJpaRepository.existsByStudentNumber(cleanNum)) {
                studentNumberAvailable = false
            }
        }

        if (!phone.isNullOrBlank()) {
            val cleanPhone = phone.trim()
            if (userJpaRepository.existsByPhone(cleanPhone)) {
                phoneAvailable = false
            }
        }

        val message = when {
            !studentNumberAvailable && !phoneAvailable -> "STUDENT_NUMBER_AND_PHONE_TAKEN"
            !studentNumberAvailable -> "STUDENT_NUMBER_TAKEN"
            !phoneAvailable -> "PHONE_TAKEN"
            else -> null
        }
        return CheckAvailabilityResponse(
            studentNumberAvailable = studentNumberAvailable,
            phoneAvailable = phoneAvailable,
            message = message
        )
    }

    @Transactional(readOnly = true)
    fun login(request: LoginRequest): AuthResponse {
        val identifier = request.resolvedIdentifier
        val password = request.resolvedPassword

        if (identifier.isBlank()) {
            throw ValidationException("凭证不能为空")
        }
        if (password.isBlank()) {
            throw ValidationException("密码不能为空")
        }

        val cleanIdentifier = identifier.trim()
        val student = studentJpaRepository.findByStudentNumber(cleanIdentifier)
        val user = when {
            student != null -> userJpaRepository.findById(student.id).orElse(null)
            cleanIdentifier.contains("@") -> {
                val emailOpt = runCatching { EmailAddress(cleanIdentifier.lowercase()) }.getOrNull()
                (emailOpt?.let { userJpaRepository.findByEmail(it) })
                    ?: userJpaRepository.findAll().firstOrNull { it.email.value.equals(cleanIdentifier, ignoreCase = true) }
            }
            else -> {
                userJpaRepository.findByPhone(cleanIdentifier)
                    ?: teacherJpaRepository?.findByEmployeeNumber(cleanIdentifier)?.let { userJpaRepository.findById(it.userId).orElse(null) }
                    ?: doctorRepository?.findByEmployeeNumber(cleanIdentifier)?.let { userJpaRepository.findById(it.userId).orElse(null) }
                    ?: headCounsellorJpaRepository?.findByEmployeeNumber(cleanIdentifier)?.let { userJpaRepository.findById(it.userId).orElse(null) }
                    ?: trialAdminJpaRepository?.findByEmployeeNumber(cleanIdentifier)?.let { userJpaRepository.findById(it.userId).orElse(null) }
                    ?: if (cleanIdentifier.equals("SYS-ADMIN", ignoreCase = true)) {
                        userJpaRepository.findAll().firstOrNull { it.role == UserRole.SYSTEM_ADMIN }
                    } else null
            }
        } ?: throw UnauthorizedException("用户不存在或密码错误")

        if (user.status != AccountStatus.ACTIVE) {
            throw UnauthorizedException("账号尚未激活或已被禁用")
        }

        if (user.passwordHash == null || !passwordEncoder.matches(password, user.passwordHash)) {
            throw UnauthorizedException("用户不存在或密码错误")
        }

        val studentRecord = student ?: studentJpaRepository.findById(user.id).orElse(null)
        val resolvedStudentNum = studentRecord?.studentNumber ?: user.phone ?: cleanIdentifier

        val token = jwtService.generateToken(
            userId = user.id,
            studentNumber = resolvedStudentNum,
            role = user.role.name
        )

        val studentDto = if (user.role == UserRole.STUDENT) {
            StudentAuthDto(
                studentNumber = resolvedStudentNum,
                fullName = user.name,
                phone = user.phone ?: "",
                createdAt = LocalDateTime.now()
            )
        } else null

        return AuthResponse(
            token = token,
            student = studentDto,
            userId = user.id,
            role = user.role,
            email = user.email.value,
            name = user.name
        )
    }

    fun sendVerificationCode(request: SendCodeRequest): SendCodeResponse {
        val phone = request.phone.trim()
        val phoneVo = MobileNumber(phone)
        val purpose = OtpPurpose.fromString(request.purpose)

        if (purpose == OtpPurpose.LOGIN) {
            if (!userJpaRepository.existsByPhone(phone)) {
                throw NotFoundException("该手机号码尚未登记，请先创建账号")
            }
        } else if (purpose == OtpPurpose.REGISTRATION) {
            val rawStudentNum = request.studentNumber?.trim()
            if (!rawStudentNum.isNullOrBlank() && studentJpaRepository.existsByStudentNumber(rawStudentNum)) {
                throw ConflictException("该学号已被注册: $rawStudentNum")
            }
            if (userJpaRepository.existsByPhone(phone)) {
                throw ConflictException("该手机号码已被注册: $phone")
            }
        }

        val outcome = otpService.sendOtp(phoneVo, purpose)
        return SendCodeResponse(
            phone = phone,
            devCode = outcome.devCode,
            expiresInSeconds = outcome.expiresInSeconds
        )
    }

    fun verifyCode(request: VerifyCodeRequest): VerifyCodeResponse {
        val phoneVo = MobileNumber(request.phone.trim())
        val purpose = OtpPurpose.fromString(request.purpose)
        val isValid = otpService.verifyOtp(phoneVo, request.code, purpose, consume = false)
        return VerifyCodeResponse(valid = isValid)
    }

    @Transactional(readOnly = true)
    fun loginWithSms(request: LoginSmsRequest): AuthResponse {
        val phone = request.phone.trim()
        val phoneVo = MobileNumber(phone)
        otpService.verifyOtp(phoneVo, request.code, OtpPurpose.LOGIN, consume = true)

        val user = userJpaRepository.findByPhone(phone)
            ?: throw NotFoundException("该手机号码尚未登记，请先创建账号")

        val student = studentJpaRepository.findById(user.id).orElse(null)
        val studentNum = student?.studentNumber ?: phone

        val token = jwtService.generateToken(
            userId = user.id,
            studentNumber = studentNum,
            role = user.role.name
        )

        return AuthResponse(
            token = token,
            student = StudentAuthDto(
                studentNumber = studentNum,
                fullName = user.name,
                phone = user.phone ?: "",
                createdAt = LocalDateTime.now()
            ),
            userId = user.id,
            role = user.role,
            email = user.email.value,
            name = user.name
        )
    }

    @Transactional(readOnly = true)
    fun getMe(user: User): StudentAuthDto {
        val student = studentJpaRepository.findById(user.id).orElse(null)
        return StudentAuthDto(
            studentNumber = student?.studentNumber ?: user.phone ?: "",
            fullName = user.name,
            phone = user.phone ?: "",
            createdAt = LocalDateTime.now()
        )
    }
}
