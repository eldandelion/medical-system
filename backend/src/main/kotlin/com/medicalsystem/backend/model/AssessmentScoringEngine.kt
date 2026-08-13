package com.medicalsystem.backend.model

import com.medicalsystem.backend.exception.AssessmentValidationException
import java.time.LocalDate

object AssessmentScoringEngine {

    fun validateAnswers(scale: AssessmentScale, answers: Map<String, Int>) {
        val missingQuestionCodes = scale.allQuestionCodes - answers.keys
        val invalidQuestionCodes = answers.keys - scale.allQuestionCodes
        
        if (missingQuestionCodes.isNotEmpty() || invalidQuestionCodes.isNotEmpty()) {
            throw AssessmentValidationException(
                missingKeys = missingQuestionCodes.toList(),
                invalidKeys = invalidQuestionCodes.toList()
            )
        }
    }

    fun scoreSection(studentId: Long, section: AssessmentSection, answers: Map<String, Int>, assignmentId: Long? = null): PsychometricTest {
        // TODO("Implement real psychometric formula scoring")
        val testType = try {
            PsychometricTestType.valueOf(section.code)
        } catch (e: IllegalArgumentException) {
            PsychometricTestType.PHQ_9 
        }

        return PsychometricTest(
            studentId = studentId,
            testType = testType,
            score = Score(points = 0, max = 0),
            testDate = LocalDate.now(),
            sourceAssignmentId = assignmentId
        )
    }
}
