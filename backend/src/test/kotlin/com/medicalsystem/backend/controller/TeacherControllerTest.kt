package com.medicalsystem.backend.controller

import com.medicalsystem.backend.dto.AssignTeacherStudentsRequest
import com.medicalsystem.backend.dto.AssignTeacherStudentsResponse
import com.medicalsystem.backend.dto.TeacherDetailDto
import com.medicalsystem.backend.dto.TeacherSummaryDto
import com.medicalsystem.backend.dto.UnassignStudentResponse
import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.GlobalExceptionHandler
import com.medicalsystem.backend.model.AccountStatus
import com.medicalsystem.backend.model.EmailAddress
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.UserRole
import com.medicalsystem.backend.service.TeacherService
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertThrows
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.whenever
import org.springframework.http.HttpStatus
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.test.web.servlet.setup.MockMvcBuilders

@ExtendWith(MockitoExtension::class)
class TeacherControllerTest {

    @Mock
    private lateinit var teacherService: TeacherService

    @InjectMocks
    private lateinit var teacherController: TeacherController

    private val adminUser = User(1L, "Admin", EmailAddress("admin@univ.edu.cn"), role = UserRole.SYSTEM_ADMIN)
    private val hcUser = User(2L, "HC", EmailAddress("hc@univ.edu.cn"), role = UserRole.HEAD_COUNSELLOR)

    @Test
    fun `SYSTEM_ADMIN and HEAD_COUNSELLOR succeed on all teacher endpoints`() {
        val summary = TeacherSummaryDto(201L, "张老师", "EMP-201", 1L, "计算机学院", AccountStatus.ACTIVE, "13800000001", "t@univ.edu.cn", 2)
        val detail = TeacherDetailDto(201L, "张老师", "EMP-201", 1L, "计算机学院", AccountStatus.ACTIVE, "13800000001", "t@univ.edu.cn", 0, emptyList())
        val assignResp = AssignTeacherStudentsResponse(1, 0, 0, listOf(10L))
        val unassignResp = UnassignStudentResponse(true, 10L)

        whenever(teacherService.getTeachers(null, null)).thenReturn(listOf(summary))
        whenever(teacherService.getTeacherDetails(201L)).thenReturn(detail)
        whenever(teacherService.assignStudents(201L, listOf(10L), hcUser)).thenReturn(assignResp)
        whenever(teacherService.unassignStudent(201L, 10L)).thenReturn(unassignResp)

        val listRes = teacherController.getTeachers(null, null, adminUser)
        assertEquals(HttpStatus.OK, listRes.statusCode)
        assertEquals(1, listRes.body?.size)

        val detailRes = teacherController.getTeacherDetails(201L, hcUser)
        assertEquals(HttpStatus.OK, detailRes.statusCode)
        assertEquals(201L, detailRes.body?.id)

        val assignRes = teacherController.assignStudents(201L, AssignTeacherStudentsRequest(listOf(10L)), hcUser)
        assertEquals(HttpStatus.OK, assignRes.statusCode)
        assertEquals(1, assignRes.body?.assignedCount)

        val unassignRes = teacherController.unassignStudent(201L, 10L, adminUser)
        assertEquals(HttpStatus.OK, unassignRes.statusCode)
        assertEquals(10L, unassignRes.body?.unassignedStudentId)
    }

    @Test
    fun `unauthorized roles and null user throw ForbiddenException on all endpoints`() {
        val forbiddenUsers: List<User?> = listOf(
            null,
            User(3L, "Teacher", EmailAddress("t@univ.edu.cn"), role = UserRole.TEACHER),
            User(4L, "Student", EmailAddress("s@univ.edu.cn"), role = UserRole.STUDENT),
            User(5L, "Doctor", EmailAddress("d@univ.edu.cn"), role = UserRole.DOCTOR),
            User(6L, "TrialAdmin", EmailAddress("ta@univ.edu.cn"), role = UserRole.TRIAL_ADMIN)
        )

        forbiddenUsers.forEach { user ->
            assertThrows(ForbiddenException::class.java) {
                teacherController.getTeachers(null, null, user)
            }
            assertThrows(ForbiddenException::class.java) {
                teacherController.getTeacherDetails(201L, user)
            }
            assertThrows(ForbiddenException::class.java) {
                teacherController.assignStudents(201L, AssignTeacherStudentsRequest(listOf(10L)), user)
            }
            assertThrows(ForbiddenException::class.java) {
                teacherController.unassignStudent(201L, 10L, user)
            }
        }
    }

    @Test
    fun `POST assignStudents with empty studentIds returns 400 Bad Request via bean validation`() {
        val mockMvc = MockMvcBuilders.standaloneSetup(teacherController)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()

        mockMvc.perform(
            post("/api/teachers/201/students")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"studentIds": []}""")
        ).andExpect(status().isBadRequest)
    }
}
