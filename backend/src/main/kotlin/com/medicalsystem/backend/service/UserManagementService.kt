package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.AdminUserDetailsDto
import com.medicalsystem.backend.dto.AdminUserSummaryDto
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.mapper.UserDetailAssembler
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.Instant

@Service
@Transactional
class UserManagementService(
    private val userJpaRepository: UserJpaRepository,
    private val studentRepository: StudentRepository,
    private val teacherJpaRepository: TeacherJpaRepository,
    private val doctorRepository: DoctorRepository,
    private val headCounsellorJpaRepository: HeadCounsellorJpaRepository,
    private val trialAdminJpaRepository: TrialAdminJpaRepository,
    private val userDetailAssembler: UserDetailAssembler
) {

    private fun validateAdmin(user: User) {
        if (user.role != UserRole.SYSTEM_ADMIN) {
            throw ForbiddenException("Only administrators can perform user management operations")
        }
    }

    @Transactional(readOnly = true)
    fun getUsers(
        role: UserRole?,
        status: AccountStatus?,
        keyword: String?,
        adminUser: User
    ): List<AdminUserSummaryDto> {
        validateAdmin(adminUser)

        var users = userJpaRepository.findAll()

        if (role != null) {
            users = users.filter { it.role == role }
        }

        if (status != null) {
            users = users.filter { it.status == status }
        }

        if (!keyword.isNullOrBlank()) {
            val kw = keyword.trim().lowercase()
            users = users.filter {
                it.name.lowercase().contains(kw) || it.email.value.lowercase().contains(kw) || it.id.toString() == kw
            }
        }

        return users.map { mapToSummary(it) }
    }

    @Transactional(readOnly = true)
    fun getUserDetails(targetUserId: Long, adminUser: User): AdminUserDetailsDto {
        validateAdmin(adminUser)

        val userEntity = userJpaRepository.findById(targetUserId)
            .orElseThrow { ResourceNotFoundException("User not found with id: $targetUserId") }

        return userDetailAssembler.assemble(userEntity)
    }

    fun updateUserStatus(
        targetUserId: Long,
        newStatus: AccountStatus,
        reason: String?,
        adminUser: User
    ): AdminUserSummaryDto {
        validateAdmin(adminUser)

        val userEntity = userJpaRepository.findById(targetUserId)
            .orElseThrow { ResourceNotFoundException("User not found with id: $targetUserId") }

        userEntity.status = newStatus
        if (newStatus == AccountStatus.DELETED) {
            userEntity.deletedAt = Instant.now()
        } else if (userEntity.deletedAt != null && newStatus == AccountStatus.ACTIVE) {
            userEntity.deletedAt = null
        }

        val saved = userJpaRepository.save(userEntity)
        return mapToSummary(saved)
    }

    fun deleteUser(targetUserId: Long, adminUser: User): AdminUserSummaryDto {
        return updateUserStatus(targetUserId, AccountStatus.DELETED, null, adminUser)
    }

    private fun mapToSummary(user: UserEntity): AdminUserSummaryDto {
        var employeeOrStudentId: String? = null
        var departmentOrCollege: String? = null
        var hospital: String? = null

        when (user.role) {
            UserRole.STUDENT -> {
                studentRepository.findById(user.id).ifPresent {
                    employeeOrStudentId = it.studentNumber
                    departmentOrCollege = "${it.major.college.name} / ${it.major.name}"
                }
            }
            UserRole.TEACHER -> {
                teacherJpaRepository.findById(user.id).ifPresent {
                    employeeOrStudentId = it.employeeNumber
                    departmentOrCollege = it.college.name
                }
            }
            UserRole.DOCTOR -> {
                doctorRepository.findById(user.id).ifPresent {
                    employeeOrStudentId = it.employeeNumber
                    departmentOrCollege = it.department?.name
                    hospital = it.department?.hospital?.name
                }
            }
            UserRole.HEAD_COUNSELLOR -> {
                headCounsellorJpaRepository.findById(user.id).ifPresent {
                    employeeOrStudentId = it.employeeNumber
                }
            }
            UserRole.TRIAL_ADMIN -> {
                trialAdminJpaRepository.findById(user.id).ifPresent {
                    employeeOrStudentId = it.employeeNumber
                    hospital = it.hospital.name
                }
            }
            UserRole.SYSTEM_ADMIN -> {
                employeeOrStudentId = "SYS-ADMIN"
                departmentOrCollege = "系统管理部"
            }
        }

        return AdminUserSummaryDto(
            id = user.id,
            name = user.name,
            email = user.email.value,
            role = user.role,
            status = user.status,
            employeeOrStudentId = employeeOrStudentId,
            departmentOrCollege = departmentOrCollege,
            hospital = hospital,
            deletedAt = user.deletedAt
        )
    }
}
