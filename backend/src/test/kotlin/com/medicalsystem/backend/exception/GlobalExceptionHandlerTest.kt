package com.medicalsystem.backend.exception

import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.http.HttpHeaders
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.header
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

class GlobalExceptionHandlerTest {

    @RestController
    class TestExceptionController {
        @GetMapping("/test/not-found")
        fun notFound(): String {
            throw NotFoundException("该手机号码尚未登记，请先创建账号")
        }

        @GetMapping("/test/too-many-requests")
        fun tooManyRequests(): String {
            throw TooManyRequestsException("发送过于频繁，请 42 秒后再试", retryAfterSeconds = 42L)
        }

        @GetMapping("/test/too-many-requests-no-retry")
        fun tooManyRequestsNoRetry(): String {
            throw TooManyRequestsException("请求过于频繁")
        }
    }

    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(TestExceptionController())
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
    }

    @Test
    fun `NotFoundException returns 404 with uniform json error body`() {
        mockMvc.perform(get("/test/not-found"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.error").value("该手机号码尚未登记，请先创建账号"))
    }

    @Test
    fun `TooManyRequestsException returns 429 with Retry-After header and json error body`() {
        mockMvc.perform(get("/test/too-many-requests"))
            .andExpect(status().isTooManyRequests)
            .andExpect(header().string(HttpHeaders.RETRY_AFTER, "42"))
            .andExpect(jsonPath("$.error").value("发送过于频繁，请 42 秒后再试"))
    }

    @Test
    fun `TooManyRequestsException without retryAfterSeconds omits Retry-After header`() {
        mockMvc.perform(get("/test/too-many-requests-no-retry"))
            .andExpect(status().isTooManyRequests)
            .andExpect(header().doesNotExist(HttpHeaders.RETRY_AFTER))
            .andExpect(jsonPath("$.error").value("请求过于频繁"))
    }
}
