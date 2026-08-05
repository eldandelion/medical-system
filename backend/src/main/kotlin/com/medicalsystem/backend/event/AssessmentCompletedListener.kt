package com.medicalsystem.backend.event

import com.medicalsystem.backend.model.StudentHealthProfileFactory
import com.medicalsystem.backend.repository.StudentHealthProfileRepository
import org.springframework.stereotype.Component
import org.springframework.transaction.annotation.Propagation
import org.springframework.transaction.annotation.Transactional
import org.springframework.transaction.event.TransactionPhase
import org.springframework.transaction.event.TransactionalEventListener

@Component
class AssessmentCompletedListener(
    private val studentHealthProfileRepository: StudentHealthProfileRepository
) {

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    fun handleAssessmentCompleted(event: AssessmentCompletedEvent) {
        val profile = studentHealthProfileRepository.findByStudentId(event.studentId).orElseGet {
            StudentHealthProfileFactory.createInitialProfile(
                studentId = event.studentId
            )
        }

        event.completedTests.forEach { test ->
            profile.recordAssessmentResult(test)
        }
        studentHealthProfileRepository.save(profile)
    }
}
