package com.medicalsystem.backend.model

data class Teacher(
    val userId: Long,
    val employeeNumber: SchoolEmployeeId,
    val collegeId: Long
)
