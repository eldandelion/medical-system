package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.SearchResultDto
import com.medicalsystem.backend.dto.StudentSearchResultDto
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.SearchService
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus
import java.time.LocalDate

@ExtendWith(MockitoExtension::class)
class SearchControllerTest {

    @Mock
    private lateinit var searchService: SearchService

    @InjectMocks
    private lateinit var searchController: SearchController

    @Test
    fun `search throws ForbiddenException when user is null`() {
        assertThrows(ForbiddenException::class.java) {
            searchController.search("test", 5, null)
        }
    }

    @Test
    fun `search returns SearchResultDto when user is authenticated`() {
        val user = User(
            id = 1L,
            name = "Teacher Zhang",
            email = EmailAddress("teacher@csu.edu.cn"),
            avatarUrl = null,
            role = UserRole.TEACHER
        )

        val mockResult = SearchResultDto(
            query = "李",
            students = listOf(
                StudentSearchResultDto(
                    id = 101L,
                    studentNumber = "2026001",
                    name = "李华",
                    majorName = "计算机科学与技术",
                    collegeName = "信息安全学院",
                    enrollmentDate = LocalDate.of(2026, 9, 1),
                    riskLevel = null
                )
            )
        )

        `when`(searchService.globalSearch("李", user, 5)).thenReturn(mockResult)

        val response = searchController.search("李", 5, user)

        assertEquals(HttpStatus.OK, response.statusCode)
        assertNotNull(response.body)
        assertEquals(1, response.body?.students?.size)
        assertEquals("李华", response.body?.students?.first()?.name)
    }

    @Test
    fun `search clamps limit to minimum 1 and maximum 20`() {
        val user = User(
            id = 2L,
            name = "Doctor Liu",
            email = EmailAddress("doctor@hospital.org"),
            avatarUrl = null,
            role = UserRole.DOCTOR
        )

        val mockResult = SearchResultDto(query = "query")
        `when`(searchService.globalSearch("query", user, 20)).thenReturn(mockResult)

        val response = searchController.search("query", 50, user)

        assertEquals(HttpStatus.OK, response.statusCode)
    }
}
