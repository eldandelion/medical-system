package com.medicalsystem.backend.util

import com.medicalsystem.backend.model.AcademicYear
import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Test
import java.time.Clock
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId

class AcademicYearCalculatorTest {

    @Test
    fun `should calculate academic year accurately before start month`() {
        // Freeze time to August 2024
        val fixedClock = Clock.fixed(Instant.parse("2024-08-15T10:00:00Z"), ZoneId.of("UTC"))
        val calculator = AcademicYearCalculator(fixedClock)

        val enrollmentDate = LocalDate.of(2023, 9, 1) // Enrolled last year
        
        // Since it's August, they haven't rolled over to the next year yet.
        // Diff = 2024 - 2023 = 1. Month < 9. So index = 1 -> FRESHMAN
        val year = calculator.calculate(enrollmentDate)

        assertEquals(AcademicYear.FRESHMAN, year)
    }

    @Test
    fun `should calculate academic year accurately after start month`() {
        // Freeze time to September 2024
        val fixedClock = Clock.fixed(Instant.parse("2024-09-15T10:00:00Z"), ZoneId.of("UTC"))
        val calculator = AcademicYearCalculator(fixedClock)

        val enrollmentDate = LocalDate.of(2023, 9, 1) // Enrolled last year
        
        // Since it's September, they roll over to the next year.
        // Diff = 2024 - 2023 = 1. Month >= 9. So index = 2 -> SOPHOMORE
        val year = calculator.calculate(enrollmentDate)

        assertEquals(AcademicYear.SOPHOMORE, year)
    }

    @Test
    fun `should handle graduated students`() {
        val fixedClock = Clock.fixed(Instant.parse("2028-09-15T10:00:00Z"), ZoneId.of("UTC"))
        val calculator = AcademicYearCalculator(fixedClock)

        val enrollmentDate = LocalDate.of(2023, 9, 1)
        
        val year = calculator.calculate(enrollmentDate)

        assertEquals(AcademicYear.GRADUATED, year)
    }
}
