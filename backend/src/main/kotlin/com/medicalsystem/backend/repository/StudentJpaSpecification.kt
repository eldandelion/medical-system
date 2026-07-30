package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.StudentVisibilityCriteria
import org.springframework.data.jpa.domain.Specification

object StudentJpaSpecification {
    fun fromVisibilityCriteria(criteria: StudentVisibilityCriteria): Specification<StudentEntity> {
        return Specification { root, _, cb ->
            when (criteria) {
                is StudentVisibilityCriteria.All -> cb.conjunction()
                is StudentVisibilityCriteria.None -> cb.disjunction() // Always false
                is StudentVisibilityCriteria.Self -> cb.equal(root.get<Long>("id"), criteria.studentId)
                is StudentVisibilityCriteria.ByAssignedTeacher -> {
                    // Uses inner join, so students without an assigned teacher are safely excluded for this role
                    val teacherJoin = root.join<Any, Any>("assignedTeacher")
                    cb.equal(teacherJoin.get<Long>("userId"), criteria.teacherId)
                }
            }
        }
    }
}
