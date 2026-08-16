package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.ReferralStepType
import com.medicalsystem.backend.model.StudentVisibilityCriteria
import org.springframework.data.jpa.domain.Specification

object StudentJpaSpecification {
    fun fromVisibilityCriteria(criteria: StudentVisibilityCriteria): Specification<StudentEntity> {
        return Specification { root, query, cb ->
            when (criteria) {
                is StudentVisibilityCriteria.All -> cb.conjunction()
                is StudentVisibilityCriteria.None -> cb.disjunction() // Always false
                is StudentVisibilityCriteria.Self -> cb.equal(root.get<Long>("id"), criteria.studentId)
                is StudentVisibilityCriteria.ByAssignedTeacher -> {
                    // Uses inner join, so students without an assigned teacher are safely excluded for this role
                    val teacherJoin = root.join<Any, Any>("assignedTeacher")
                    cb.equal(teacherJoin.get<Long>("userId"), criteria.teacherId)
                }
                is StudentVisibilityCriteria.ByAssignedDoctor -> {
                    val referralSubq = query.subquery(Long::class.java)
                    val refRoot = referralSubq.from(ReferralEntity::class.java)
                    val destJoin = refRoot.join<Any, Any>("destination")
                    val docJoin = destJoin.join<Any, Any>("doctor")
                    referralSubq.select(refRoot.get("studentId"))
                        .where(
                            cb.equal(refRoot.get<Long>("studentId"), root.get<Long>("id")),
                            cb.equal(docJoin.get<Long>("userId"), criteria.doctorId)
                        )
                    cb.exists(referralSubq)
                }
                is StudentVisibilityCriteria.ByTrialAdmin -> {
                    val referralSubq = query.subquery(Long::class.java)
                    val refRoot = referralSubq.from(ReferralEntity::class.java)
                    val stepsJoin = refRoot.join<Any, Any>("steps")
                    referralSubq.select(refRoot.get("studentId"))
                        .where(
                            cb.equal(refRoot.get<Long>("studentId"), root.get<Long>("id")),
                            stepsJoin.get<Enum<*>>("type").`in`(
                                listOf(
                                    ReferralStepType.TRIAGE,
                                    ReferralStepType.SCHEDULING,
                                    ReferralStepType.EVALUATION,
                                    ReferralStepType.FEEDBACK
                                )
                            )
                        )
                    cb.exists(referralSubq)
                }
            }
        }
    }
}
