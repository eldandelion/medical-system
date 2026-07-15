package com.medicalsystem.backend.security

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Teacher
import com.medicalsystem.backend.model.User
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.AfterEach
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.*
import org.springframework.core.MethodParameter
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.ModelAndViewContainer

class CurrentUserArgumentResolverTest {

    private lateinit resolver: CurrentUserArgumentResolver

    @BeforeEach
    fun setUp() {
        resolver = CurrentUserArgumentResolver()
        MockSecurityContextHolder.clearContext()
    }
    
    @AfterEach
    fun tearDown() {
        MockSecurityContextHolder.clearContext()
    }

    @Test
    fun `supportsParameter should return true when parameter is of type User and annotated with CurrentUser`() {
        val method = TestController::class.java.getMethod("testMethod", User::class.java)
        val parameter = MethodParameter(method, 0)
        
        assertTrue(resolver.supportsParameter(parameter), "Resolver should support User annotated with @CurrentUser")
    }

    @Test
    fun `supportsParameter should return false when parameter is of type User but lacks CurrentUser annotation`() {
        val method = TestController::class.java.getMethod("testMethodWithoutAnnotation", User::class.java)
        val parameter = MethodParameter(method, 0)
        
        assertFalse(resolver.supportsParameter(parameter), "Resolver should not support User without @CurrentUser annotation")
    }
    
    @Test
    fun `supportsParameter should return false when parameter has CurrentUser annotation but is not of type User`() {
        val method = TestController::class.java.getMethod("testMethodWithWrongType", String::class.java)
        val parameter = MethodParameter(method, 0)
        
        assertFalse(resolver.supportsParameter(parameter), "Resolver should not support non-User types even if annotated")
    }
    
    @Test
    fun `resolveArgument should correctly return user from initialized security context`() {
        val method = TestController::class.java.getMethod("testMethod", User::class.java)
        val parameter = MethodParameter(method, 0)
        
        val mockUser = Teacher(id = 1L, name = "Test Teacher", email = EmailAddress("teacher@univ.edu.cn"), departmentId = 10L, phone = null)
        MockSecurityContextHolder.getContext().user = mockUser
        
        val result = resolver.resolveArgument(
            parameter,
            mock(ModelAndViewContainer::class.java),
            mock(NativeWebRequest::class.java),
            mock(WebDataBinderFactory::class.java)
        )
        
        assertNotNull(result, "Result should not be null")
        assertEquals(mockUser, result, "Should return the user from the security context")
    }

    @Test
    fun `resolveArgument should return null when security context has no user`() {
        val method = TestController::class.java.getMethod("testMethod", User::class.java)
        val parameter = MethodParameter(method, 0)
        
        // Security context is clear (user is null)
        val result = resolver.resolveArgument(
            parameter,
            mock(ModelAndViewContainer::class.java),
            mock(NativeWebRequest::class.java),
            mock(WebDataBinderFactory::class.java)
        )
        
        assertNull(result, "Should return null if context is empty")
    }

    // Dummy controller class for extracting specific MethodParameters for the tests
    private class TestController {
        fun testMethod(@CurrentUser user: User) {}
        fun testMethodWithoutAnnotation(user: User) {}
        fun testMethodWithWrongType(@CurrentUser notAUser: String) {}
    }
}
