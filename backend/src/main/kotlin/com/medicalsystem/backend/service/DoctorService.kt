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
        
        val startOfWeek = determineTargetWorkWeekStart(now)
        val endOfWeek = determineTargetWorkWeekEnd(startOfWeek)

        val appointments = appointmentRepository.findActiveAppointmentsForDoctorWithinTimeframe(
            doctorId,
            startOfWeek.toInstant(),
            endOfWeek.toInstant()
        )
        
        return appointments.map { it.appointmentTime.toString() }
    }

    private fun determineTargetWorkWeekStart(now: ZonedDateTime): ZonedDateTime {
        val currentDayOfWeek = now.dayOfWeek
        
        val targetMonday = if (currentDayOfWeek == DayOfWeek.SATURDAY || currentDayOfWeek == DayOfWeek.SUNDAY) {
            now.with(TemporalAdjusters.next(DayOfWeek.MONDAY))
        } else {
            now.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        }
        
        return targetMonday.truncatedTo(ChronoUnit.DAYS)
    }

    private fun determineTargetWorkWeekEnd(startOfWeek: ZonedDateTime): ZonedDateTime {
        return startOfWeek.plusWeeks(WEEK_OFFSET).minusNanos(NANOS_OFFSET)
    }

    companion object {
        private const val WEEK_OFFSET = 1L
        private const val NANOS_OFFSET = 1L
    }
}
