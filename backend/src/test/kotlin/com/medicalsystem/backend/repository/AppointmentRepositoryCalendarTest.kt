package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AppointmentEntity
import com.medicalsystem.backend.model.AppointmentStatus
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional
import jakarta.persistence.EntityManager
import java.time.Instant

@SpringBootTest
@Transactional
class AppointmentRepositoryCalendarTest {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var appointmentRepository: AppointmentRepository

    @Test
    fun `findActiveAppointmentsForDoctorWithinTimeframe only returns SCHEDULED or COMPLETED slots matching bounds`() {
        // Arrange
        val doctorId = 997L
        val otherDoctorId = 998L
        
        // Define an explicit test range: July 6 to July 12, 2026
        val searchStart = Instant.parse("2026-07-06T00:00:00Z")
        val searchEnd = Instant.parse("2026-07-12T23:59:59Z")
        
        // 1. Valid: Inside range, Correct Doctor, SCHEDULED -> SHOULD BE INCLUDED
        val validScheduled = AppointmentEntity(doctorId = doctorId, appointmentTime = Instant.parse("2026-07-09T09:00:00Z"), status = AppointmentStatus.SCHEDULED)
        entityManager.persist(validScheduled)

        // 2. Valid: Inside range, Correct Doctor, COMPLETED -> SHOULD BE INCLUDED
        val validCompleted = AppointmentEntity(doctorId = doctorId, appointmentTime = Instant.parse("2026-07-10T14:00:00Z"), status = AppointmentStatus.COMPLETED)
        entityManager.persist(validCompleted)

        // 3. Invalid: Outside range (past) -> EXCLUDED
        val pastAppointment = AppointmentEntity(doctorId = doctorId, appointmentTime = Instant.parse("2026-07-05T23:59:59Z"), status = AppointmentStatus.SCHEDULED)
        entityManager.persist(pastAppointment)

        // 4. Invalid: Outside range (future) -> EXCLUDED
        val futureAppointment = AppointmentEntity(doctorId = doctorId, appointmentTime = Instant.parse("2026-07-13T00:00:00Z"), status = AppointmentStatus.SCHEDULED)
        entityManager.persist(futureAppointment)

        // 5. Invalid: Wrong Doctor -> EXCLUDED
        val otherDoctorAppointment = AppointmentEntity(doctorId = otherDoctorId, appointmentTime = Instant.parse("2026-07-09T10:00:00Z"), status = AppointmentStatus.SCHEDULED)
        entityManager.persist(otherDoctorAppointment)

        // 6. Invalid: Cancelled status -> EXCLUDED
        val cancelledAppointment = AppointmentEntity(doctorId = doctorId, appointmentTime = Instant.parse("2026-07-09T11:00:00Z"), status = AppointmentStatus.CANCELLED)
        entityManager.persist(cancelledAppointment)

        // 7. Invalid: Soft Deleted -> EXCLUDED
        val softDeletedAppointment = AppointmentEntity(doctorId = doctorId, appointmentTime = Instant.parse("2026-07-09T12:00:00Z"), status = AppointmentStatus.SCHEDULED).apply { 
            deletedAt = Instant.now() 
        }
        entityManager.persist(softDeletedAppointment)

        entityManager.flush()

        // Act
        val results = appointmentRepository.findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId = doctorId,
            start = searchStart,
            end = searchEnd
        )

        // Assert
        assertEquals(2, results.size, "Should only return the two valid active appointments inside the range")
        
        val returnedTimes = results.map { it.appointmentTime }.toSet()
        assertEquals(setOf(validScheduled.appointmentTime, validCompleted.appointmentTime), returnedTimes)
    }
}
