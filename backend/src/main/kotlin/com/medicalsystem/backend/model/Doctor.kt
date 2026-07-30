package com.medicalsystem.backend.model

data class Doctor(
    val userId: Long,
    val employeeNumber: HospitalEmployeeId,
    val departmentId: Long,
    val phone: PhoneNumber?
)
