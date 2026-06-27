package com.medicalsystem.backend.util

import com.medicalsystem.backend.model.AcademicYear
import org.springframework.stereotype.Component
import java.time.Clock
import java.time.LocalDate

@Component
class AcademicYearCalculator(private val clock: Clock) {

    companion object {
        const val DEFAULT_START_MONTH = 9
        const val ACADEMIC_YEAR_OFFSET = 1
        const val MIN_INDEX = 0
    }

    fun calculate(enrollmentDate: LocalDate, startMonth: Int = DEFAULT_START_MONTH): AcademicYear {
        val currentDate = LocalDate.now(clock)
        val yearDiff = currentDate.year - enrollmentDate.year
        val academicYearIndex = if (currentDate.monthValue >= startMonth) {
            yearDiff + ACADEMIC_YEAR_OFFSET
        } else {
            yearDiff
        }

        val years = AcademicYear.values()
        val safeIndex = academicYearIndex.coerceIn(MIN_INDEX, years.size - 1)
        return years[safeIndex]
    }
}
