package com.medicalsystem.backend.dto

data class ReferralDetailsDto(
    val baseInfo: ReferralDto,
    val studentDemographics: StudentDemographicsDto,
    val triageInfo: TriageInfoDto,
    val riskAssessment: RiskAssessmentDto,
    val feedback: FeedbackDto? = null
)

data class StudentDemographicsDto(
    val studentId: String,
    val school: String,
    val grade: String,
    val phone: String,
    val age: Int? = null,
    val gender: String? = null
)

data class TriageInfoDto(
    val isFirstVisit: Boolean,
    val isMedicated: Boolean,
    val priorTherapy: String,
    val scidDiagnosis: String? = null,
    val fullDescription: String
)

data class RiskAssessmentDto(
    val ideation: Boolean,
    val attempt: Boolean,
    val selfHarm: Boolean,
    val notes: String? = null
)

data class FeedbackDto(
    val summary: String,
    val followUp: String,
    val attachments: List<AttachmentDto> = emptyList()
)

