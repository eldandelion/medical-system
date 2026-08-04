package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.User
import com.medicalsystem.backend.model.StudentVisibilityPolicy
import com.medicalsystem.backend.repository.StudentJpaSpecification
import jakarta.persistence.criteria.CriteriaBuilder
import jakarta.persistence.criteria.CriteriaQuery
import jakarta.persistence.criteria.Predicate
import jakarta.persistence.criteria.Root
import org.springframework.data.jpa.domain.Specification

object AssessmentCohortSpecification {
    fun buildSpecification(
        majorId: Long?,
        collegeId: Long?,
        academicYear: Int?,
        assigner: User
    ): Specification<StudentEntity> {
        return Specification { root, query, cb ->
            val predicates = mutableListOf<Predicate>()

            if (majorId != null) {
                val majorJoin = root.join<StudentEntity, Any>("major")
                predicates.add(cb.equal(majorJoin.get<Long>("id"), majorId))
            } else if (collegeId != null) {
                val majorJoin = root.join<StudentEntity, Any>("major")
                val collegeJoin = majorJoin.join<Any, Any>("college")
                predicates.add(cb.equal(collegeJoin.get<Long>("id"), collegeId))
            }

            if (academicYear != null) {
                val yearExpr = cb.function("year", Integer::class.java, root.get<java.sql.Date>("enrollmentDate"))
                predicates.add(cb.equal(yearExpr, academicYear))
            }

            val criteria = StudentVisibilityPolicy.getVisibilityCriteria(assigner)
            val visibilitySpec = StudentJpaSpecification.fromVisibilityCriteria(criteria)
            val visibilityPredicate = visibilitySpec.toPredicate(root, query, cb)
            if (visibilityPredicate != null) {
                predicates.add(visibilityPredicate)
            }

            cb.and(*predicates.toTypedArray())
        }
    }
}
