package com.medicalsystem.backend.model

data class HeadCounsellor(
    val userId: Long,
    val employeeNumber: SchoolEmployeeId,
    val schoolId: Long,
    val departmentId: Long
)
