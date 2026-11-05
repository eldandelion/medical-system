package com.medicalsystem.backend.controller

import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.Assertions.*
import org.mockito.kotlin.*
import java.util.Optional

class StudentProfileAuthorizationTest {
    private val students = mock<StudentRepository>()
    private val profiles = mock<StudentHealthProfileJpaRepository>()
    private val controller = StudentProfileController(mock(), mock(), mock(), profiles, students)
    private fun user(role: UserRole) = User(7L, "Staff", EmailAddress("staff@example.test"), null, role)
    private val update = StudentProfileController.UpdateHealthProfileDto("synthetic diagnosis")

    @Test
    fun `visible assigned doctor can update diagnosis`() {
        val doctor = user(UserRole.DOCTOR)
        whenever(students.findByIdAndVisibleTo(11L, doctor)).thenReturn(Optional.of(mock<Student>()))
        whenever(profiles.findByStudentId(11L)).thenReturn(Optional.empty())
        assertEquals(200, controller.updateHealthProfile(11L, update, doctor).statusCode.value())
        verify(profiles).save(check { assertEquals("synthetic diagnosis", it.scidDiagnosis) })
    }

    @Test
    fun `out of scope clinical roles cannot read or mutate profile`() {
        for (role in listOf(UserRole.DOCTOR, UserRole.HEAD_COUNSELLOR)) {
            val actor = user(role)
            whenever(students.findByIdAndVisibleTo(11L, actor)).thenReturn(Optional.empty())
            assertThrows(ForbiddenException::class.java) { controller.updateHealthProfile(11L, update, actor) }
        }
        verifyNoInteractions(profiles)
    }

    @Test
    fun `non clinical role denied before student lookup`() {
        assertThrows(ForbiddenException::class.java) {
            controller.updateHealthProfile(11L, update, user(UserRole.TEACHER))
        }
        verifyNoInteractions(students, profiles)
    }
}
