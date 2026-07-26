package com.medicalsystem.backend.model

data class TrialAdmin(
    val userId: Long,
    val employeeNumber: HospitalEmployeeId,
    val hospitalId: Long
)
