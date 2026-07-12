package com.medicalsystem.backend.controller

import com.medicalsystem.backend.exception.ForbiddenException
import com.medicalsystem.backend.exception.NotFoundException
import com.medicalsystem.backend.service.DoctorService
import com.medicalsystem.backend.repository.DepartmentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertTrue
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.junit.jupiter.MockitoExtension
import org.springframework.http.HttpStatus

@ExtendWith(MockitoExtension::class)
class DoctorControllerCalendarTest {

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var departmentRepository: DepartmentRepository

    @Mock
    private lateinit var doctorService: DoctorService

    @InjectMocks
    private lateinit var doctorController: DoctorController

    @Test
    fun `GET calendar should return 200 OK with occupied slots mapped to JSON array`() {
        val doctorId = 997L
        val mockSlots = listOf("2026-07-13T09:00:00Z", "2026-07-14T14:30:00Z")
        `when`(doctorService.getOccupiedSlotsForCurrentWeek(doctorId)).thenReturn(mockSlots)

        val response = doctorController.getDoctorCalendar(doctorId)
        
        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body
        assertTrue(body != null)
        assertTrue(body!!.containsKey("occupiedSlots"))
        assertEquals(mockSlots, body["occupiedSlots"])
    }

    @Test
    fun `GET calendar should return 200 OK with empty array when doctor has no appointments`() {
        val doctorId = 997L
        `when`(doctorService.getOccupiedSlotsForCurrentWeek(doctorId)).thenReturn(emptyList())

        val response = doctorController.getDoctorCalendar(doctorId)
        
        assertEquals(HttpStatus.OK, response.statusCode)
        val body = response.body
        assertTrue(body != null)
        assertTrue(body!!.containsKey("occupiedSlots"))
        assertTrue((body["occupiedSlots"] as List<*>).isEmpty())
    }

    @Test
    fun `GET calendar should throw ForbiddenException when accessed by unauthorized user role`() {
        val doctorId = 997L
        `when`(doctorService.getOccupiedSlotsForCurrentWeek(doctorId))
            .thenThrow(ForbiddenException("Only the assigned doctor can view this schedule"))

        assertThrows<ForbiddenException> {
            doctorController.getDoctorCalendar(doctorId)
        }
    }

    @Test
    fun `GET calendar should throw NotFoundException when doctor ID does not exist`() {
        val invalidDoctorId = 9999L
        `when`(doctorService.getOccupiedSlotsForCurrentWeek(invalidDoctorId))
            .thenThrow(NotFoundException("Doctor not found"))

        assertThrows<NotFoundException> {
            doctorController.getDoctorCalendar(invalidDoctorId)
        }
    }
}
