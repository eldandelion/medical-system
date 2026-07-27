package com.medicalsystem.backend.model

import java.time.LocalDate

data class Student(
    val id: Long,
    val studentNumber: String,
    val name: String,
    val major: Major,
    val enrollmentDate: LocalDate,
    val riskStatus: RiskStatus,
    val demographics: Demographics? = null,
    val assignedTeacherId: Long? = null
) : AggregateRoot() {
    
    fun register(riskLevel: String?) {
        if (this.id != 0L) {
            registerEvent(
                com.medicalsystem.backend.event.StudentRegisteredEvent(
                    studentId = this.id,
                    riskLevel = riskLevel
                )
            )
        }
    }
}
