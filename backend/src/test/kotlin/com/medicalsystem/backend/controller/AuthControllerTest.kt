package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.VerifyIdentifierRequest
import com.medicalsystem.backend.dto.VerifyIdentifierResponse
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.UserVerificationService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class AuthControllerTest {

    @Mock
    private lateinit var userVerificationService: UserVerificationService

    @InjectMocks
    private lateinit var authController: AuthController

    @Test
    fun `verifyIdentifier returns ok with verification response`() {
        val request = VerifyIdentifierRequest("liming@univ.edu.cn")
        val expectedResponse = VerifyIdentifierResponse(
            exists = true,
            isAccountActive = true,
            maskedIdentifier = "li***g@univ.edu.cn",
            role = UserRole.STUDENT
        )

        `when`(userVerificationService.verifyIdentifier(request)).thenReturn(expectedResponse)

        val response = authController.verifyIdentifier(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertTrue(response.body!!.exists)
        assertTrue(response.body!!.isAccountActive)
        assertEquals(UserRole.STUDENT, response.body!!.role)
    }

    @Test
    fun `verifyIdentifier returns ok with exists false when not found`() {
        val request = VerifyIdentifierRequest("unknown@univ.edu.cn")
        val expectedResponse = VerifyIdentifierResponse(exists = false)

        `when`(userVerificationService.verifyIdentifier(request)).thenReturn(expectedResponse)

        val response = authController.verifyIdentifier(request)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertFalse(response.body!!.exists)
    }
}
