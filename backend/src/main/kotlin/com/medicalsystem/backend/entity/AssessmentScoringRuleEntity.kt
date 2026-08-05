package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "assessment_scoring_rules")
class AssessmentScoringRuleEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scale_id", nullable = false)
    var scale: AssessmentScaleEntity? = null,

    @Column(name = "rule_type", nullable = false)
    var ruleType: String,

    @Column(name = "min_score")
    var minScore: Int? = null,

    @Column(name = "max_score")
    var maxScore: Int? = null,

    @Column(nullable = false)
    var level: String,

    @Column(name = "is_high_risk", nullable = false)
    var isHighRisk: Boolean = false,

    @Column(name = "crisis_flag")
    var crisisFlag: String? = null,

    @Column(name = "order_num", nullable = false)
    var orderNum: Int = 0
)
