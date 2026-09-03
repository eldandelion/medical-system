package com.medicalsystem.backend.dto

data class EthnicityDto(
    val id: Long,
    val name: String
)

data class SchoolDto(
    val id: Long,
    val name: String
)

data class SchoolDepartmentDto(
    val id: Long,
    val name: String,
    val schoolId: Long
)

data class HospitalSummaryDto(
    val id: Long,
    val name: String,
    val address: String? = null,
    val contactPhone: String? = null
)

data class HospitalDepartmentDto(
    val id: Long,
    val name: String,
    val hospitalId: Long
)
