package com.medicalsystem.backend.service

import com.medicalsystem.backend.repository.AppointmentRepository
import org.springframework.stereotype.Service
import java.time.Clock
import java.time.DayOfWeek
import java.time.ZoneId
import java.time.ZonedDateTime
import java.time.temporal.ChronoUnit
import java.time.temporal.TemporalAdjusters

@Service
class DoctorService(
    private val appointmentRepository: AppointmentRepository,
    private val clock: Clock = Clock.systemDefaultZone()
) {

    fun getOccupiedSlotsForCurrentWeek(doctorId: Long): List<String> {
        val now = ZonedDateTime.now(clock)
        
        val currentDayOfWeek = now.dayOfWeek
        
        val targetMonday = if (currentDayOfWeek == DayOfWeek.SATURDAY || currentDayOfWeek == DayOfWeek.SUNDAY) {
            now.with(TemporalAdjusters.next(DayOfWeek.MONDAY))
        } else {
            now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        }
        
        val startOfWeek = targetMonday.truncatedTo(ChronoUnit.DAYS)
            
        val endOfWeek = startOfWeek.plusDays(6)
            .withHour(23)
            .withMinute(59)
            .withSecond(59)
            .withNano(999999999)

        val appointments = appointmentRepository.findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId,
            startOfWeek.toInstant(),
            endOfWeek.toInstant()
        )
        
        return appointments.map { it.appointmentTime.toString() }
    }
}
