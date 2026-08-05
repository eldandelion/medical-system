package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentScaleEntity
import com.medicalsystem.backend.model.AssessmentScaleType
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AssessmentScaleJpaRepository : JpaRepository<AssessmentScaleEntity, Long> {
    @EntityGraph(attributePaths = [
        "sections",
        "sections.questions",
        "sections.questions.optionGroup",
        "sections.questions.optionGroup.options",
        "sections.questions.customOptions",
        "scoringRules"
    ])
    fun findByScaleType(scaleType: AssessmentScaleType): AssessmentScaleEntity?

    @EntityGraph(attributePaths = [
        "sections",
        "sections.questions",
        "sections.questions.optionGroup",
        "sections.questions.optionGroup.options",
        "sections.questions.customOptions",
        "scoringRules"
    ])
    override fun findAll(): List<AssessmentScaleEntity>
}
