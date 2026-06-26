package com.medicalsystem.backend.dto

data class StudentDto(
    val id: String?,
    val studentNumber: String,
    val name: String,
    val major: String,
    val year: String,
    val status: String
)
