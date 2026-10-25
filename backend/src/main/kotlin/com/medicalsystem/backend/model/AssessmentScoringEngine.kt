package com.medicalsystem.backend.model

import com.medicalsystem.backend.exception.AssessmentValidationException
import java.time.LocalDate

object AssessmentScoringEngine {

    fun validateAnswers(scale: AssessmentScale, answers: Map<String, Any>) {
        val normalizedAnswerKeys = answers.keys.filterNot { it.startsWith("__note_") }.toSet()
        val missingQuestionCodes = scale.allQuestionCodes - normalizedAnswerKeys
        val invalidQuestionCodes = normalizedAnswerKeys - scale.allQuestionCodes
        
        if (missingQuestionCodes.isNotEmpty() || invalidQuestionCodes.isNotEmpty()) {
            throw AssessmentValidationException(
                missingKeys = missingQuestionCodes.toList(),
                invalidKeys = invalidQuestionCodes.toList()
            )
        }
    }

    fun resolveTestType(sectionCode: String): PsychometricTestType? {
        return when (sectionCode.lowercase().trim()) {
            "phq_9", "phq9", "phq9_survey" -> PsychometricTestType.PHQ_9
            "gad_7", "gad7", "gad7_survey" -> PsychometricTestType.GAD_7
            "bdi_ii", "bdiii" -> PsychometricTestType.BDI_II
            "bai" -> PsychometricTestType.BAI
            "psqi", "psqi_survey" -> PsychometricTestType.PSQI
            "iss", "isi", "isi_survey" -> PsychometricTestType.ISS
            "ess" -> PsychometricTestType.ESS
            "scl_90", "scl90", "scl90_survey" -> PsychometricTestType.SCL_90
            "apq_9_father" -> PsychometricTestType.APQ_9_FATHER
            "apq_9_mother" -> PsychometricTestType.APQ_9_MOTHER
            "sleep_disorder" -> PsychometricTestType.SLEEP_DISORDER
            else -> runCatching { PsychometricTestType.valueOf(sectionCode.uppercase()) }.getOrNull()
        }
    }

    fun scoreSectionOrNull(
        studentId: Long,
        section: AssessmentSection,
        answers: Map<String, Any>,
        assignmentId: Long? = null
    ): PsychometricTest? {
        val testType = resolveTestType(section.code) ?: return null
        return buildPsychometricTest(studentId, testType, section, answers, assignmentId)
    }

    fun scoreSection(
        studentId: Long,
        section: AssessmentSection,
        answers: Map<String, Any>,
        assignmentId: Long? = null
    ): PsychometricTest {
        val testType = resolveTestType(section.code) ?: PsychometricTestType.PHQ_9
        return buildPsychometricTest(studentId, testType, section, answers, assignmentId)
    }

    private fun buildPsychometricTest(
        studentId: Long,
        testType: PsychometricTestType,
        section: AssessmentSection,
        answers: Map<String, Any>,
        assignmentId: Long?
    ): PsychometricTest {
        var totalPoints = 0
        var totalMax = 0

        for (question in section.questions) {
            val rawAns = answers[question.code]
            val ansPoints = when (rawAns) {
                is Number -> rawAns.toInt()
                is String -> rawAns.toIntOrNull() ?: 0
                else -> 0
            }.coerceAtLeast(0)
            totalPoints += ansPoints

            val qMax = question.effectiveOptions
                .mapNotNull { opt ->
                    when (val v = opt.value) {
                        is Number -> v.toInt()
                        is String -> v.toIntOrNull()
                        else -> null
                    }
                }
                .maxOrNull()
                ?: question.max?.toInt()
                ?: 0
            totalMax += qMax.coerceAtLeast(0)
        }

        val safeMax = totalMax.coerceAtLeast(totalPoints)

        return PsychometricTest(
            studentId = studentId,
            testType = testType,
            score = Score(points = totalPoints, max = safeMax),
            testDate = LocalDate.now(),
            sourceAssignmentId = assignmentId
        )
    }
}
