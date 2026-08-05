package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "assessment_options")
class AssessmentOptionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id")
    var optionGroup: AssessmentOptionGroupEntity? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id")
    var question: AssessmentQuestionEntity? = null,

    @Column(name = "option_value", nullable = false)
    var value: Int,

    @Column(name = "option_label", nullable = false)
    var label: String
)
