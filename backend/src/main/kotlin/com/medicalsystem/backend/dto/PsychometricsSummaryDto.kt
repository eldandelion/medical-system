package com.medicalsystem.backend.dto

import com.medicalsystem.backend.model.FlagStatus
import java.time.LocalDate

data class PsychometricsSummaryDto(
    val scidDiagnosis: String?,
    val riskFlags: List<RiskFlagDto>,
    val scores: List<ScoreTrendDto>,
    val radarData: List<RadarDataDto>,
    val tests: List<PsychometricTestDto>
)

data class RiskFlagDto(
    val label: String,
    val value: Boolean
)

data class ScoreTrendDto(
    val date: String,
    val value: Int
)

data class RadarDataDto(
    val subject: String,
    val A: Int,
    val fullMark: Int
)

data class PsychometricTestDto(
    val name: String,
    val value: Int,
    val max: Int,
    val level: String,
    val date: String,
    val sourceAssignmentId: Long? = null
)
