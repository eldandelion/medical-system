package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.entity.StudentEntity
import com.medicalsystem.backend.model.StudentVisibilityCriteria
import com.medicalsystem.backend.model.VisibilityCriteria
import org.springframework.data.jpa.domain.Specification

object SearchSpecifications {

    fun studentSearch(criteria: StudentVisibilityCriteria, query: String): Specification<StudentEntity> {
        val visibilitySpec = StudentJpaSpecification.fromVisibilityCriteria(criteria)
        val keywordSpec = Specification<StudentEntity> { root, _, cb ->
            val pattern = "%${query.trim().lowercase()}%"
            val majorJoin = root.join<Any, Any>("major")
            cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("studentNumber")), pattern),
                cb.like(cb.lower(majorJoin.get("name")), pattern)
            )
        }
        return visibilitySpec.and(keywordSpec)
    }

    fun referralSearch(criteria: VisibilityCriteria, query: String): Specification<ReferralEntity> {
        val visibilitySpec = ReferralJpaSpecification.fromVisibilityCriteria(criteria)
        val keywordSpec = Specification<ReferralEntity> { root, q, cb ->
            val pattern = "%${query.trim().lowercase()}%"

            // Correlated subquery for matching student name or number on referral
            val studentSubq = q.subquery(Long::class.java)
            val studentRoot = studentSubq.from(StudentEntity::class.java)
            studentSubq.select(studentRoot.get("id"))
                .where(
                    cb.equal(studentRoot.get<Long>("id"), root.get<Long>("studentId")),
                    cb.or(
                        cb.like(cb.lower(studentRoot.get("name")), pattern),
                        cb.like(cb.lower(studentRoot.get("studentNumber")), pattern)
                    )
                )

            cb.or(
                cb.like(cb.lower(root.get("title")), pattern),
                cb.like(cb.lower(root.get("description")), pattern),
                cb.exists(studentSubq)
            )
        }
        return visibilitySpec.and(keywordSpec)
    }
}
