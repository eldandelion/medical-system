package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.AppointmentEntity
import com.medicalsystem.backend.repository.AppointmentRepository
import com.medicalsystem.backend.repository.DepartmentRepository
import com.medicalsystem.backend.repository.UserRepository
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.ArgumentCaptor
import org.mockito.Captor
import org.mockito.Mock
import org.mockito.Mockito.`when`
import org.mockito.Mockito.verify
import org.mockito.junit.jupiter.MockitoExtension
import java.time.Clock
import java.time.Instant
import java.time.ZoneId
import java.time.ZonedDateTime

@ExtendWith(MockitoExtension::class)
class DoctorServiceCalendarTest {

    @Mock
    private lateinit var appointmentRepository: AppointmentRepository

    @Mock
    private lateinit var userRepository: UserRepository

    @Mock
    private lateinit var departmentRepository: DepartmentRepository

    @Captor
    private lateinit var startCaptor: ArgumentCaptor<Instant>

    @Captor
    private lateinit var endCaptor: ArgumentCaptor<Instant>

    private lateinit var doctorService: DoctorService

    // Fixed Wednesday in the middle of a known week
    // Wednesday, July 8, 2026, 12:00:00 PM UTC
    private val fixedInstant = Instant.parse("2026-07-08T12:00:00Z")
    private val zoneId = ZoneId.of("Asia/Shanghai")

    @BeforeEach
    fun setUp() {
        // Inject a fixed clock so date bounds are 100% deterministic
        val fixedClock = Clock.fixed(fixedInstant, zoneId)
        doctorService = DoctorService(appointmentRepository, userRepository, departmentRepository, fixedClock)
    }

    @Test
    fun `getOccupiedSlotsForCurrentWeek calculates exact Monday to Sunday bounds and formats to ISO-8601`() {
        // Arrange
        val doctorId = 997L
        
        // Expected Monday 00:00:00 Asia/Shanghai
        val expectedStart = ZonedDateTime.of(2026, 7, 6, 0, 0, 0, 0, zoneId).toInstant()
        // Expected Sunday 23:59:59.999 Asia/Shanghai (or just before Monday)
        val expectedEnd = ZonedDateTime.of(2026, 7, 12, 23, 59, 59, 999999999, zoneId).toInstant()

        val mockAppointment = AppointmentEntity(
            id = 1L,
            doctorId = doctorId,
            appointmentTime = Instant.parse("2026-07-09T09:00:00Z"),
            status = com.medicalsystem.backend.model.AppointmentStatus.SCHEDULED
        )
        
        // Return dummy data only if the EXACT arguments are passed.
        // We use mockito captors to explicitly verify the bounds calculation.
        `when`(appointmentRepository.findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId, expectedStart, expectedEnd
        )).thenReturn(listOf(mockAppointment))

        // Act
        val result = doctorService.getOccupiedSlotsForCurrentWeek(doctorId)

        // Assert
        verify(appointmentRepository).findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId, expectedStart, expectedEnd
        )
        
        assertEquals(1, result.size)
        assertEquals("2026-07-09T09:00:00Z", result[0])
    }
    
    @Test
    fun `getOccupiedSlotsForCurrentWeek returns empty list when no appointments fall within timeframe`() {
        // Arrange
        val doctorId = 997L
        val expectedStart = ZonedDateTime.of(2026, 7, 6, 0, 0, 0, 0, zoneId).toInstant()
        val expectedEnd = ZonedDateTime.of(2026, 7, 12, 23, 59, 59, 999999999, zoneId).toInstant()

        `when`(appointmentRepository.findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId, expectedStart, expectedEnd
        )).thenReturn(emptyList())

        // Act
        val result = doctorService.getOccupiedSlotsForCurrentWeek(doctorId)

        // Assert
        assertEquals(0, result.size)
    }

    @Test
    fun `getOccupiedSlotsForCurrentWeek shifts to next week when today is weekend`() {
        // Arrange
        val doctorId = 997L
        // Fixed Sunday, July 12, 2026, 12:00:00 PM UTC
        val sundayInstant = Instant.parse("2026-07-12T12:00:00Z")
        val fixedClock = Clock.fixed(sundayInstant, zoneId)
        val weekendDoctorService = DoctorService(appointmentRepository, userRepository, departmentRepository, fixedClock)

        // Expected Monday 00:00:00 Asia/Shanghai of NEXT week
        val expectedStart = ZonedDateTime.of(2026, 7, 13, 0, 0, 0, 0, zoneId).toInstant()
        // Expected Sunday 23:59:59.999 Asia/Shanghai of NEXT week
        val expectedEnd = ZonedDateTime.of(2026, 7, 19, 23, 59, 59, 999999999, zoneId).toInstant()

        `when`(appointmentRepository.findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId, expectedStart, expectedEnd
        )).thenReturn(emptyList())

        // Act
        val result = weekendDoctorService.getOccupiedSlotsForCurrentWeek(doctorId)

        // Assert
        verify(appointmentRepository).findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId, expectedStart, expectedEnd
        )
        assertEquals(0, result.size)
    }
}
