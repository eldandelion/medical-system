package com.medicalsystem.backend.controller

import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.Notification
import com.medicalsystem.backend.model.NotificationActionType
import com.medicalsystem.backend.model.NotificationMessageCode
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.NotificationService
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.mockito.Mockito.mock
import org.mockito.Mockito.`when`
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import org.springframework.core.MethodParameter
import java.time.LocalDateTime

class NotificationControllerTest {

    private lateinit var mockMvc: MockMvc
    private val notificationService = mock(NotificationService::class.java)

    @BeforeEach
    fun setUp() {
        val resolver = object : HandlerMethodArgumentResolver {
            override fun supportsParameter(parameter: MethodParameter) = true
            override fun resolveArgument(parameter: MethodParameter, mavContainer: ModelAndViewContainer?, webRequest: NativeWebRequest, binderFactory: WebDataBinderFactory?): Any? {
                return webRequest.getAttribute("currentUser", NativeWebRequest.SCOPE_REQUEST)
            }
        }
        mockMvc = MockMvcBuilders.standaloneSetup(NotificationController(notificationService))
            .setCustomArgumentResolvers(resolver)
            .build()
    }

    @Test
    fun `GET api notifications returns current user notifications`() {
        val user = User(id = 1L, name = "Test User", email = EmailAddress("test@test.com"), role = UserRole.TEACHER)
        val notifications = listOf(
            Notification(id = 1, userId = user.id, messageCode = NotificationMessageCode.REFERRAL_SUBMITTED_INITIATOR, actionType = NotificationActionType.NONE, actionTargetId = 1L, isRead = false, createdAt = LocalDateTime.now())
        )
        `when`(notificationService.getNotificationsForUser(user.id)).thenReturn(notifications)

        mockMvc.perform(get("/api/notifications").requestAttr("currentUser", user))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$[0].messageCode").value("REFERRAL_SUBMITTED_INITIATOR"))
            .andExpect(jsonPath("$[0].read").value(false))
    }

    @Test
    fun `PATCH api notifications id read marks notification as read`() {
        val user = User(id = 1L, name = "Test User", email = EmailAddress("test@test.com"), role = UserRole.TEACHER)
        val notificationId = 1L

        mockMvc.perform(patch("/api/notifications/$notificationId/read").requestAttr("currentUser", user))
            .andExpect(status().isOk)
    }
}
