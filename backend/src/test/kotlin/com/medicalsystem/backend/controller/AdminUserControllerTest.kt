package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AdminUserDetailsDto
import com.medicalsystem.backend.dto.AdminUserSummaryDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.UserManagementService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class AdminUserControllerTest {

    @Mock
    private lateinit var userManagementService: UserManagementService

    @InjectMocks
    private lateinit var adminUserController: AdminUserController

    private val adminUser = User(
        id = 1L,
        name = "Admin",
        email = EmailAddress("admin@univ.edu.cn"),
        role = UserRole.SYSTEM_ADMIN
    )

    @Test
    fun `getUserDetails returns 200 with AdminUserDetailsDto`() {
        val detailsDto = AdminUserDetailsDto(
            id = 10L,
            name = "Student Alex",
            email = "alex@univ.edu.cn",
            role = UserRole.STUDENT,
            status = AccountStatus.ACTIVE
        )

        `when`(userManagementService.getUserDetails(10L, adminUser)).thenReturn(detailsDto)

        val response = adminUserController.getUserDetails(10L, adminUser)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(10L, response.body?.id)
        assertEquals("Student Alex", response.body?.name)
    }

    @Test
    fun `getUserDetails throws ForbiddenException when user is null`() {
        assertThrows(ForbiddenException::class.java) {
            adminUserController.getUserDetails(10L, null)
        }
    }
}
