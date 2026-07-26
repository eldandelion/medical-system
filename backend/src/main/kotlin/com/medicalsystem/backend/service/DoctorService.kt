package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.DoctorDto
import com.medicalsystem.backend.repository.AppointmentRepository
import com.medicalsystem.backend.repository.DepartmentRepository
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.repository.DoctorRepository
import org.springframework.data.repository.findByIdOrNull
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
    private val userRepository: UserRepository,
    private val departmentRepository: DepartmentRepository,
    private val doctorRepository: DoctorRepository,
    private val clock: Clock = Clock.systemDefaultZone()
) {

    fun getAllDoctors(): List<DoctorDto> =
        doctorRepository.findAll().map { doctorEntity ->
            val departmentName = doctorEntity.department?.id?.let { departmentRepository.findByIdOrNull(it)?.name } ?: "未知部门"
            val doctorUser = userRepository.findById(doctorEntity.userId).orElse(null)
            DoctorDto(
                id = doctorEntity.userId,
                name = doctorUser?.name ?: "Unknown",
                departmentName = departmentName
            )
        }

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
