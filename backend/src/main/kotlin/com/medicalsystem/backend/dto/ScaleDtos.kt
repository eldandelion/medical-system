package com.medicalsystem.backend.dto

data class ScaleSummaryDto(
    val code: String,
    val title: String,
    val subtitle: String? = null,
    val description: String,
    val questionCount: Int,
    val estimatedMinutes: Int,
    val status: String,
    val answeredCount: Int? = null,
    val completionPercentage: Int? = null
)

data class SubmitScaleRequest(
    val answers: Map<String, Any> = emptyMap()
)

data class SubmitScaleResponse(
    val scaleCode: String,
    val status: String,
    val completedAt: String
)

data class StudentDemographicsProfileDto(
    @get:com.fasterxml.jackson.annotation.JsonProperty("isSubmitted")
    val isSubmitted: Boolean,
    val gender: String? = null,
    val ethnicity: String? = null,
    val major: String? = null,
    val birthday: String? = null,
    val idCardNumber: String? = null,
    val email: String? = null,
    val homeAddress: String? = null,
    val emergencyContact: String? = null,
    val emergencyPhone: String? = null,
    val completedAt: String? = null
)

data class StudentProfileResponseDto(
    val studentNumber: String,
    val fullName: String,
    val phone: String,
    val registeredAt: String,
    @get:com.fasterxml.jackson.annotation.JsonProperty("isDemographicsSubmitted")
    val isDemographicsSubmitted: Boolean,
    val demographics: StudentDemographicsProfileDto
)
