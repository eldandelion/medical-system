package com.medicalsystem.backend.service

import com.medicalsystem.backend.repository.StudentJpaRepository
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager
import org.springframework.transaction.TransactionDefinition
import org.springframework.transaction.support.TransactionSynchronization
import org.springframework.transaction.support.TransactionSynchronizationManager
import org.springframework.transaction.support.TransactionTemplate

/** Optional projection runs only after core submission commits, in a fresh transaction. */
@Service
class DemographicsProjectionService(
    private val students: StudentJpaRepository,
    private val projector: DemographicsProjector,
    transactionManager: PlatformTransactionManager
) {
    private val logger = LoggerFactory.getLogger(javaClass)
    private val transaction = TransactionTemplate(transactionManager).apply {
        propagationBehavior = TransactionDefinition.PROPAGATION_REQUIRES_NEW
    }

    fun afterSubmission(studentId: Long, answers: Map<String, Any>) {
        val snapshot = answers.toMap()
        val project = {
            try {
                // Catch outside executeWithoutResult: flush AND commit failures must
                // roll back only this transaction, never poison the core submission.
                transaction.executeWithoutResult {
                    students.findById(studentId).ifPresent { student ->
                        projector.projectDemographics(student, snapshot)
                        students.saveAndFlush(student)
                    }
                }
            } catch (_: Exception) {
                // Do not log exception messages: constraints can include health/ID values.
                logger.warn("Optional demographics projection failed for student {}", studentId)
            }
        }
        if (TransactionSynchronizationManager.isActualTransactionActive() &&
            TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(object : TransactionSynchronization {
                override fun afterCommit() { project() }
            })
        } else {
            project()
        }
    }
}
