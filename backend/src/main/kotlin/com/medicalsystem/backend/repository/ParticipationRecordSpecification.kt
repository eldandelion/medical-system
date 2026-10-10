package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentAssignmentEntity
import com.medicalsystem.backend.entity.AssessmentDispatchEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.ResultSeverity
import jakarta.persistence.criteria.Predicate
import org.springframework.data.jpa.domain.Specification

object ParticipationRecordSpecification {
    fun withFilters(
        dispatchId: Long?,
        studentName: String?,
        studentNumber: String?,
        severity: ResultSeverity?
    ): Specification<AssessmentAssignmentEntity> {
        return Specification { root, _, cb ->
            val predicates = mutableListOf<Predicate>()
            
            dispatchId?.let {
                predicates.add(cb.equal(root.get<AssessmentDispatchEntity>("dispatch").get<Long>("id"), it))
            }
            severity?.let {
                predicates.add(cb.equal(root.get<ResultSeverity>("severity"), it))
            }
            
            if (!studentName.isNullOrBlank() || !studentNumber.isNullOrBlank()) {
                val studentJoin = root.join<AssessmentAssignmentEntity, StudentEntity>("student")
                if (!studentName.isNullOrBlank()) {
                    predicates.add(cb.like(studentJoin.get("name"), "%$studentName%"))
                }
                if (!studentNumber.isNullOrBlank()) {
                    predicates.add(cb.like(studentJoin.get("studentNumber"), "%$studentNumber%"))
                }
            }
            
            cb.and(*predicates.toTypedArray())
        }
    }
}
