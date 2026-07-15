package com.medicalsystem.backend.security

import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.UserRepository
import jakarta.servlet.FilterChain
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.mock.web.MockHttpServletRequest
import org.springframework.mock.web.MockHttpServletResponse

class MockAuthenticationFilterTest {

    private lateinit var filter: MockAuthenticationFilter
    private lateinit var userRepository: UserRepository
    private lateinit var request: MockHttpServletRequest
    private lateinit var response: MockHttpServletResponse
    private lateinit var chain: FilterChain

    @BeforeEach
    fun setUp() {
        userRepository = mock(UserRepository::class.java)
        filter = MockAuthenticationFilter(userRepository)
        request = MockHttpServletRequest()
        response = MockHttpServletResponse()
        chain = mock(FilterChain::class.java)
        MockSecurityContextHolder.clearContext()
    }
    
    @AfterEach
    fun tearDown() {
        MockSecurityContextHolder.clearContext()
    }

    @Test
    fun `should authenticate teacher and continue filter chain when teacher token provided`() {
        request.addHeader("Authorization", "Bearer teacher_token_zhang_123")
        val mockTeacher = Teacher(id = 1L, name = "艾米丽·沃森", email = EmailAddress("teacher@univ.edu.cn"), collegeId = 10L)
        `when`(userRepository.findByName("艾米丽·沃森")).thenReturn(mockTeacher)

        doAnswer {
            val context = MockSecurityContextHolder.getContext()
            assertNotNull(context.user, "User should be set in context")
            assertEquals(mockTeacher.id, context.user?.id)
            null
        }.`when`(chain).doFilter(request, response)

        filter.doFilter(request, response, chain)

        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should authenticate head councillor and continue filter chain when head councillor token provided`() {
        request.addHeader("Authorization", "Bearer head_councillor_token")
        val mockCouncillor = HeadCounsellor(id = 5L, name = "Real Councillor", email = EmailAddress("hc@univ.edu.cn"))
        `when`(userRepository.findAll()).thenReturn(listOf(mockCouncillor))

        doAnswer {
            val context = MockSecurityContextHolder.getContext()
            assertNotNull(context.user, "Head councillor should be resolved")
            assertEquals(mockCouncillor.id, context.user?.id)
            null
        }.`when`(chain).doFilter(request, response)

        filter.doFilter(request, response, chain)

        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should continue filter chain without setting user when authorization header is missing`() {
        doAnswer {
            val context = MockSecurityContextHolder.getContext()
            assertNull(context.user, "User should remain null when no token is provided")
            null
        }.`when`(chain).doFilter(request, response)

        filter.doFilter(request, response, chain)

        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should continue filter chain without setting user when authorization header is blank`() {
        request.addHeader("Authorization", "   ")
        
        doAnswer {
            val context = MockSecurityContextHolder.getContext()
            assertNull(context.user, "User should remain null for blank token")
            null
        }.`when`(chain).doFilter(request, response)

        filter.doFilter(request, response, chain)

        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should fallback to first user and continue chain when token is unrecognized`() {
        request.addHeader("Authorization", "Bearer some_random_token")
        val fallbackUser = Teacher(id = 2L, name = "Fallback Teacher", email = EmailAddress("fallback@univ.edu.cn"), collegeId = 10L)
        `when`(userRepository.findAll()).thenReturn(listOf(fallbackUser))

        doAnswer {
            val context = MockSecurityContextHolder.getContext()
            assertNotNull(context.user)
            assertEquals(fallbackUser.id, context.user?.id)
            null
        }.`when`(chain).doFilter(request, response)

        filter.doFilter(request, response, chain)

        verify(chain).doFilter(request, response)
    }
    
    @Test
    fun `should not set user and continue chain when token is unrecognized and database is empty`() {
        request.addHeader("Authorization", "Bearer some_random_token")
        `when`(userRepository.findAll()).thenReturn(emptyList())

        doAnswer {
            val context = MockSecurityContextHolder.getContext()
            assertNull(context.user, "User should remain null if DB is empty on fallback")
            null
        }.`when`(chain).doFilter(request, response)

        filter.doFilter(request, response, chain)

        verify(chain).doFilter(request, response)
    }
}
