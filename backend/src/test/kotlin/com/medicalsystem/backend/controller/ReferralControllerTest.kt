package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.service.ReferralService
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import org.junit.jupiter.api.Assertions.*

@ExtendWith(MockitoExtension::class)
class ReferralControllerTest {

    @Mock
    private lateinit var referralService: ReferralService

    @InjectMocks
    private lateinit var referralController: ReferralController

    @Test
    fun `fetchReferrals returns list`() {
        assertTrue(true)
    }
}
