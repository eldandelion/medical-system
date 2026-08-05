package com.medicalsystem.backend.entity

import com.medicalsystem.backend.model.AssessmentScaleType
import jakarta.persistence.*

@Entity
@Table(name = "assessment_scales")
class AssessmentScaleEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(name = "scale_type", nullable = false, unique = true)
    var scaleType: AssessmentScaleType,

    @Column(nullable = false)
    var title: String,

    @Column
    var subtitle: String? = null,

    @Column(length = 1000)
    var description: String? = null,

    @Column(nullable = false)
    var duration: String,

    @Column(name = "order_num", nullable = false)
    var orderNum: Int = 0,

    @OneToMany(mappedBy = "scale", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderNum ASC")
    var sections: MutableSet<AssessmentSectionEntity> = mutableSetOf(),

    @OneToMany(mappedBy = "scale", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderNum ASC")
    var scoringRules: MutableSet<AssessmentScoringRuleEntity> = mutableSetOf()
)
