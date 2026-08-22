package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.*
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Gender
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.UserProfileService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class UserProfileControllerTest {

    @Mock
    private lateinit var userProfileService: UserProfileService

    @InjectMocks
    private lateinit var userProfileController: UserProfileController

    private val sampleUser = User(
        id = 100L,
        name = "Student User",
        email = EmailAddress("student@example.com"),
        role = UserRole.STUDENT
    )

    private val sampleProfile = UserProfileDto(
        id = 100L,
        name = "Student User",
        role = UserRole.STUDENT,
        email = "student@example.com",
        avatarInitial = "S",
        avatarBg = "#E47035",
        studentProfile = StudentProfileDetailsDto(
            studentNumber = "STU-2023001",
            school = "中南大学",
            major = "计算机科学",
            academicYear = "2023级",
            gender = Gender.MALE,
            birthday = "2001年2月5日",
            ethnicity = "汉族",
            idCardNumber = "110101200301011234",
            contactNumber = "13800138000",
            homeAddress = "北京市海淀区",
            emergencyContactName = "张三",
            emergencyContactPhone = "13900139000"
        )
    )

    @Test
    fun `getProfile throws ForbiddenException when user is null`() {
        assertThrows(ForbiddenException::class.java) {
            userProfileController.getProfile(null)
        }
    }

    @Test
    fun `getProfile returns user profile for authenticated user`() {
        `when`(userProfileService.getProfile(sampleUser)).thenReturn(sampleProfile)

        val response = userProfileController.getProfile(sampleUser)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals("Student User", response.body?.name)
        assertEquals("STU-2023001", response.body?.studentProfile?.studentNumber)
        assertEquals("中南大学", response.body?.studentProfile?.school)
    }

    @Test
    fun `updateProfile throws ForbiddenException when user is null`() {
        val request = UpdateUserProfileRequest(name = "New Name")
        assertThrows(ForbiddenException::class.java) {
            userProfileController.updateProfile(request, null)
        }
    }

    @Test
    fun `updateProfile updates and returns profile for authenticated user`() {
        val request = UpdateUserProfileRequest(
            name = "Updated Name",
            contactNumber = "13900000000"
        )
        val updatedProfile = sampleProfile.copy(name = "Updated Name")
        `when`(userProfileService.updateProfile(sampleUser, request)).thenReturn(updatedProfile)

        val response = userProfileController.updateProfile(request, sampleUser)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertEquals("Updated Name", response.body?.name)
    }
}
