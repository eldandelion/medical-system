package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.model.VisibilityCriteria
import org.springframework.data.jpa.domain.Specification

object ReferralJpaSpecification {

    fun fromVisibilityCriteria(criteria: VisibilityCriteria): Specification<ReferralEntity> {
        return Specification { root, query, cb ->
            when (criteria) {
                is VisibilityCriteria.All -> cb.conjunction()
                
                is VisibilityCriteria.ByInitiator -> 
                    cb.equal(root.get<Long>("referredById"), criteria.initiatorId)
                
                is VisibilityCriteria.ByStatuses -> 
                    root.get<Enum<*>>("status").`in`(criteria.statuses)
                
                is VisibilityCriteria.ByAssignedDoctor -> {
                    val destinationJoin = root.join<Any, Any>("destination")
                    val doctorJoin = destinationJoin.join<Any, Any>("doctor")
                    cb.equal(doctorJoin.get<Long>("id"), criteria.doctorId)
                }
                
                is VisibilityCriteria.InitiatedOrStatuses -> {
                    val initiatedPredicate = cb.equal(root.get<Long>("referredById"), criteria.initiatorId)
                    val statusPredicate = root.get<Enum<*>>("status").`in`(criteria.statuses)
                    cb.or(initiatedPredicate, statusPredicate)
                }

                is VisibilityCriteria.BySubject -> {
                    val studentPredicate = cb.equal(root.get<Long>("studentId"), criteria.studentId)
                    val notExcludedStatuses = cb.not(root.get<Enum<*>>("status").`in`(criteria.excludedStatuses))
                    cb.and(studentPredicate, notExcludedStatuses)
                }

                is VisibilityCriteria.HasReachedStep -> {
                    query.distinct(true)
                    val stepsJoin = root.join<Any, Any>("steps")
                    stepsJoin.get<Enum<*>>("type").`in`(criteria.stepTypes)
                }
            }
        }
    }
}
