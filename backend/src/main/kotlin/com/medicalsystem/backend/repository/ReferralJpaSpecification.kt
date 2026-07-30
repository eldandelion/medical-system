package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.model.VisibilityCriteria
import org.springframework.data.jpa.domain.Specification

object ReferralJpaSpecification {

    fun fromVisibilityCriteria(criteria: VisibilityCriteria): Specification<ReferralEntity> {
        return Specification { root, query, cb ->
            when (criteria) {
                is VisibilityCriteria.All -> cb.conjunction()
                
                is VisibilityCriteria.ForTeacher -> {
                val initiatedByTeacher = cb.equal(root.get<Long>("referredById"), criteria.teacherId)

                    // Subquery to check if the student is assigned to this teacher
                    val assignedTeacherSubq = query.subquery(Long::class.java)
                    val studentRoot = assignedTeacherSubq.from(com.medicalsystem.backend.entity.StudentEntity::class.java)
                    val teacherJoin = studentRoot.join<Any, Any>("assignedTeacher")
                    assignedTeacherSubq.select(teacherJoin.get("userId"))
                        .where(cb.equal(studentRoot.get<Long>("id"), root.get<Long>("studentId")))

                    // Subquery to check if the referrer's role is in the allowed list defined by the Domain
                    val referrerRoleSubq = query.subquery(Long::class.java)
                    val userRoot = referrerRoleSubq.from(com.medicalsystem.backend.entity.UserEntity::class.java)
                    referrerRoleSubq.select(userRoot.get("id"))
                        .where(
                            cb.equal(userRoot.get<Long>("id"), root.get<Long>("referredById")),
                            userRoot.get<Enum<*>>("role").`in`(criteria.allowedInitiatorRoles)
                        )

                    val assignedAndAllowedPredicate = cb.and(
                        cb.exists(referrerRoleSubq),
                        cb.equal(assignedTeacherSubq, criteria.teacherId)
                    )

                    cb.or(initiatedByTeacher, assignedAndAllowedPredicate)
                }
                
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
