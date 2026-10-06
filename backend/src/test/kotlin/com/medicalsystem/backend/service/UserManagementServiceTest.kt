package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.CollegeEntity
import com.medicalsystem.backend.entity.TeacherEntity
import com.medicalsystem.backend.entity.UserEntity
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class UserManagementServiceTest {

    @Mock
    private lateinit var userJpaRepository: UserJpaRepository

    @Mock
    private lateinit var studentRepository: StudentRepository

    @Mock
    private lateinit var teacherJpaRepository: TeacherJpaRepository

    @Mock
    private lateinit var doctorRepository: DoctorRepository

    @Mock
    private lateinit var headCounsellorJpaRepository: HeadCounsellorJpaRepository

    @Mock
    private lateinit var trialAdminJpaRepository: TrialAdminJpaRepository

    @Mock
    private lateinit var userDetailAssembler: com.medicalsystem.backend.mapper.UserDetailAssembler

    @Mock
    private lateinit var emailSenderPort: com.medicalsystem.backend.port.EmailSenderPort

    @InjectMocks
    private lateinit var userManagementService: UserManagementService

    private val adminUser = User(
        id = 99L,
        name = "System Admin",
        email = EmailAddress("admin@univ.edu.cn"),
        role = UserRole.SYSTEM_ADMIN
    )

    private val nonAdminUser = User(
        id = 1L,
        name = "Teacher Li",
        email = EmailAddress("teacher@univ.edu.cn"),
        role = UserRole.TEACHER
    )

    @Test
    fun `getUsers throws ForbiddenException for non-admin user`() {
        assertThrows(ForbiddenException::class.java) {
            userManagementService.getUsers(null, null, null, nonAdminUser)
        }
    }

    @Test
    fun `getUsers returns filtered list of users with enriched role details`() {
        val u1 = UserEntity(id = 10L, name = "Zhang Teacher", email = EmailAddress("zhang@univ.edu.cn"), role = UserRole.TEACHER, status = AccountStatus.ACTIVE)
        val u2 = UserEntity(id = 20L, name = "Li Student", email = EmailAddress("li@univ.edu.cn"), role = UserRole.STUDENT, status = AccountStatus.PENDING_APPROVAL)

        val college = CollegeEntity(id = 1L, name = "Medical College")
        val teacherEntity = TeacherEntity(userId = 10L, employeeNumber = "EMP-10", college = college)

        `when`(userJpaRepository.findAll()).thenReturn(listOf(u1, u2))
        `when`(teacherJpaRepository.findById(10L)).thenReturn(Optional.of(teacherEntity))

        val result = userManagementService.getUsers(UserRole.TEACHER, null, null, adminUser)

        assertEquals(1, result.size)
        assertEquals("Zhang Teacher", result[0].name)
        assertEquals("EMP-10", result[0].employeeOrStudentId)
        assertEquals("Medical College", result[0].departmentOrCollege)
    }

    @Test
    fun `updateUserStatus to DELETED sets deletedAt and rejectionReason and sends email`() {
        val userEntity = UserEntity(id = 10L, name = "Zhang", email = EmailAddress("zhang@univ.edu.cn"), role = UserRole.TEACHER, status = AccountStatus.PENDING_APPROVAL)
        `when`(userJpaRepository.findById(10L)).thenReturn(Optional.of(userEntity))
        `when`(userJpaRepository.save(userEntity)).thenReturn(userEntity)

        val deletedResult = userManagementService.updateUserStatus(10L, AccountStatus.DELETED, "Not a valid ID", adminUser)
        assertEquals(AccountStatus.DELETED, deletedResult.status)
        assertNotNull(userEntity.deletedAt)
        assertEquals("Not a valid ID", userEntity.rejectionReason)
        org.mockito.Mockito.verify(emailSenderPort).sendAccountRejection(EmailAddress("zhang@univ.edu.cn"), "Not a valid ID")
    }

    @Test
    fun `updateUserStatus to ACTIVE removes deletedAt and sends approval email`() {
        val userEntity = UserEntity(id = 10L, name = "Zhang", email = EmailAddress("zhang@univ.edu.cn"), role = UserRole.TEACHER, status = AccountStatus.PENDING_APPROVAL)
        `when`(userJpaRepository.findById(10L)).thenReturn(Optional.of(userEntity))
        `when`(userJpaRepository.save(userEntity)).thenReturn(userEntity)

        val activeResult = userManagementService.updateUserStatus(10L, AccountStatus.ACTIVE, null, adminUser)
        assertEquals(AccountStatus.ACTIVE, activeResult.status)
        assertNull(userEntity.deletedAt)
        org.mockito.Mockito.verify(emailSenderPort).sendAccountApproval(EmailAddress("zhang@univ.edu.cn"))
    }

    @Test
    fun `getUserDetails throws ForbiddenException for non-admin user`() {
        assertThrows(ForbiddenException::class.java) {
            userManagementService.getUserDetails(10L, nonAdminUser)
        }
    }

    @Test
    fun `getUserDetails throws ResourceNotFoundException for non-existent user`() {
        `when`(userJpaRepository.findById(999L)).thenReturn(Optional.empty())

        assertThrows(com.medicalsystem.backend.exception.ResourceNotFoundException::class.java) {
            userManagementService.getUserDetails(999L, adminUser)
        }
    }

    @Test
    fun `getUserDetails delegates to UserDetailAssembler for valid user`() {
        val userEntity = UserEntity(id = 10L, name = "Zhang", email = EmailAddress("zhang@univ.edu.cn"), role = UserRole.TEACHER, status = AccountStatus.ACTIVE)
        val expectedDto = com.medicalsystem.backend.dto.AdminUserDetailsDto(
            id = 10L,
            name = "Zhang",
            email = "zhang@univ.edu.cn",
            role = UserRole.TEACHER,
            status = AccountStatus.ACTIVE
        )

        `when`(userJpaRepository.findById(10L)).thenReturn(Optional.of(userEntity))
        `when`(userDetailAssembler.assemble(userEntity)).thenReturn(expectedDto)

        val result = userManagementService.getUserDetails(10L, adminUser)
        assertEquals(10L, result.id)
        assertEquals("Zhang", result.name)
        assertEquals(UserRole.TEACHER, result.role)
    }
}

