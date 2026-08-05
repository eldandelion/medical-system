package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.PsychometricTestDto
import com.medicalsystem.backend.dto.PsychometricsSummaryDto
import com.medicalsystem.backend.dto.RadarDataDto
import com.medicalsystem.backend.dto.RiskFlagDto
import com.medicalsystem.backend.dto.ScoreTrendDto
import com.medicalsystem.backend.model.FlagStatus
import com.medicalsystem.backend.model.RiskFlagName
import com.medicalsystem.backend.model.Student
import com.medicalsystem.backend.model.StudentHealthProfile
import com.medicalsystem.backend.model.PsychometricTestType
import org.springframework.stereotype.Component

@Component
class PsychometricSummaryMapper {

    fun toDto(student: Student, profile: StudentHealthProfile?): PsychometricsSummaryDto {
        // Map Risk Flags guaranteeing all 3 exist
        val existingFlags = profile?.riskFlags?.associateBy { it.name } ?: emptyMap()
        val riskFlags = RiskFlagName.entries.map { flagName ->
            val entityFlag = existingFlags[flagName]
            RiskFlagDto(
                label = flagName.name,
                value = entityFlag?.status == FlagStatus.POSITIVE
            )
        }

        // Map Raw Tests
        val tests = profile?.getLatestTests() ?: emptyList()
        val testDtos = tests.map { test ->
            PsychometricTestDto(
                name = test.testType.name,
                value = test.score.points,
                max = test.score.max,
                level = if (test.score.points > test.score.max * 0.8) "High" else "Normal",
                date = test.testDate.toString()
            )
        }

        // Extract Trend (GAD-7 as an example)
        val gad7Tests = tests.filter { it.testType == PsychometricTestType.GAD_7 }.sortedBy { it.testDate }
        val scores = gad7Tests.map { test ->
            ScoreTrendDto(
                date = test.testDate.toString(),
                value = test.score.points
            )
        }

        // Compute Radar Data from latest unique tests
        val latestTests = profile?.getUniqueLatestTests() ?: emptyMap()
        val radarData = latestTests.values.map { test ->
            RadarDataDto(
                subject = test.testType.name,
                A = test.score.points,
                fullMark = test.score.max
            )
        }

        return PsychometricsSummaryDto(
            scidDiagnosis = profile?.scidDiagnosis,
            riskFlags = riskFlags,
            scores = scores,
            radarData = radarData,
            tests = testDtos
        )
    }
}
