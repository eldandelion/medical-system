package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.VerifyIdentifierRequest
import com.medicalsystem.backend.dto.VerifyIdentifierResponse
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.DoctorRepository
import com.medicalsystem.backend.repository.HeadCounsellorJpaRepository
import com.medicalsystem.backend.repository.StudentJpaRepository
import com.medicalsystem.backend.repository.TeacherJpaRepository
import com.medicalsystem.backend.repository.TrialAdminJpaRepository
import com.medicalsystem.backend.repository.UserJpaRepository
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class UserVerificationService(
    private val userJpaRepository: UserJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val doctorRepository: DoctorRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val trialAdminJpaRepository: TrialAdminJpaRepository
) {

    fun verifyIdentifier(request: VerifyIdentifierRequest): VerifyIdentifierResponse {
        val rawInput = request.identifier.trim()
        if (rawInput.isBlank()) {
            return VerifyIdentifierResponse(exists = false)
        }

        val userEntity: UserEntity? = if (rawInput.contains("@")) {
            resolveByEmail(rawInput)
        } else {
            resolveByIdNumber(rawInput)
        }

        if (userEntity == null || userEntity.deletedAt != null) {
            return VerifyIdentifierResponse(exists = false)
        }

        val isActive = userEntity.status == AccountStatus.ACTIVE
        val masked = maskIdentifier(rawInput)

        return VerifyIdentifierResponse(
            exists = true,
            isAccountActive = isActive,
            status = userEntity.status,
            maskedIdentifier = masked,
            role = userEntity.role
        )
    }

    private fun resolveByEmail(email: String): UserEntity? =
        userJpaRepository.findAll().firstOrNull { it.email.value.equals(email, ignoreCase = true) }

    private fun resolveByIdNumber(idNumber: String): UserEntity? {
        // 1. Check student number (highest user volume)
        studentJpaRepository.findByStudentNumber(idNumber)?.let { student ->
            return userJpaRepository.findById(student.id).orElse(null)
        }

        // 2. Check teacher employee number
        teacherJpaRepository.findByEmployeeNumber(idNumber)?.let { teacher ->
            return userJpaRepository.findById(teacher.userId).orElse(null)
        }

        // 3. Check doctor employee number
        doctorRepository.findByEmployeeNumber(idNumber)?.let { doctor ->
            return userJpaRepository.findById(doctor.userId).orElse(null)
        }

        // 4. Check head counsellor employee number
        headCounsellorJpaRepository.findByEmployeeNumber(idNumber)?.let { hc ->
            return userJpaRepository.findById(hc.userId).orElse(null)
        }

        // 5. Check trial admin employee number
        trialAdminJpaRepository.findByEmployeeNumber(idNumber)?.let { ta ->
            return userJpaRepository.findById(ta.userId).orElse(null)
        }

        // 6. System admin shortcut identifier
        if (idNumber.equals("SYS-ADMIN", ignoreCase = true)) {
            return userJpaRepository.findAll().firstOrNull { it.role == UserRole.SYSTEM_ADMIN }
        }

        return null
    }

    private fun maskIdentifier(input: String): String {
        return if (input.contains("@")) {
            val parts = input.split("@")
            val name = parts[0]
            val domain = parts.getOrNull(1) ?: ""
            if (name.length <= 3) "${name.first()}***@$domain"
            else "${name.take(2)}***${name.takeLast(1)}@$domain"
        } else {
            if (input.length <= 4) input
            else "${input.take(2)}****${input.takeLast(2)}"
        }
    }
}
