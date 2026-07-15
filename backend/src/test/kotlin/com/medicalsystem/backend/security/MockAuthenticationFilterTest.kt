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

    private lateinit filter: MockAuthenticationFilter
    private lateinit userRepository: UserRepository
    private lateinit request: MockHttpServletRequest
    private lateinit response: MockHttpServletResponse
    private lateinit chain: FilterChain

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
        val mockTeacher = Teacher(id = 1L, name = "艾米丽·沃森", email = EmailAddress("teacher@univ.edu.cn"), departmentId = 10L, phone = null)
        `when`(userRepository.findByName("艾米丽·沃森")).thenReturn(mockTeacher)

        filter.doFilter(request, response, chain)

        val context = MockSecurityContextHolder.getContext()
        assertNotNull(context.user, "User should be set in context")
        assertEquals(mockTeacher.id, context.user?.id)
        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should authenticate head councillor and continue filter chain when head councillor token provided`() {
        request.addHeader("Authorization", "Bearer head_councillor_token")
        val mockCouncillor = HeadCounsellor(id = 5L, name = "Real Councillor", email = EmailAddress("hc@univ.edu.cn"))
        `when`(userRepository.findAll()).thenReturn(listOf(mockCouncillor))

        filter.doFilter(request, response, chain)

        val context = MockSecurityContextHolder.getContext()
        assertNotNull(context.user, "Head councillor should be resolved")
        assertEquals(mockCouncillor.id, context.user?.id)
        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should continue filter chain without setting user when authorization header is missing`() {
        filter.doFilter(request, response, chain)

        val context = MockSecurityContextHolder.getContext()
        assertNull(context.user, "User should remain null when no token is provided")
        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should continue filter chain without setting user when authorization header is blank`() {
        request.addHeader("Authorization", "   ")
        
        filter.doFilter(request, response, chain)

        val context = MockSecurityContextHolder.getContext()
        assertNull(context.user, "User should remain null for blank token")
        verify(chain).doFilter(request, response)
    }

    @Test
    fun `should fallback to first user and continue chain when token is unrecognized`() {
        request.addHeader("Authorization", "Bearer some_random_token")
        val fallbackUser = Teacher(id = 2L, name = "Fallback Teacher", email = EmailAddress("fallback@univ.edu.cn"), departmentId = 10L, phone = null)
        `when`(userRepository.findAll()).thenReturn(listOf(fallbackUser))

        filter.doFilter(request, response, chain)

        val context = MockSecurityContextHolder.getContext()
        assertNotNull(context.user)
        assertEquals(fallbackUser.id, context.user?.id)
        verify(chain).doFilter(request, response)
    }
    
    @Test
    fun `should not set user and continue chain when token is unrecognized and database is empty`() {
        request.addHeader("Authorization", "Bearer some_random_token")
        `when`(userRepository.findAll()).thenReturn(emptyList())

        filter.doFilter(request, response, chain)

        val context = MockSecurityContextHolder.getContext()
        assertNull(context.user, "User should remain null if DB is empty on fallback")
        verify(chain).doFilter(request, response)
    }
}
