package com.medicalsystem.backend.model

import java.time.LocalDate

data class Student(
    val id: Long,
    val studentNumber: String,
    val name: String,
    val major: Major,
    val enrollmentDate: LocalDate,
    val riskStatus: RiskStatus
)
