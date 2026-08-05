package com.medicalsystem.backend.model

import java.time.LocalDate

data class PsychometricTest(
    val id: Long? = null,
    val studentId: Long,
    val testType: PsychometricTestType,
    val score: Score,
    val testDate: LocalDate
)
