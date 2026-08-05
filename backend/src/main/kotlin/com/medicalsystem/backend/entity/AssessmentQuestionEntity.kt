package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "assessment_questions")
class AssessmentQuestionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    var section: AssessmentSectionEntity? = null,

    @Column(nullable = false)
    var code: String,

    @Column(name = "question_text", nullable = false, length = 1000)
    var text: String,

    @Column(name = "order_num", nullable = false)
    var orderNum: Int = 0,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "option_group_id")
    var optionGroup: AssessmentOptionGroupEntity? = null,

    @OneToMany(mappedBy = "question", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("value ASC")
    var customOptions: MutableSet<AssessmentOptionEntity> = mutableSetOf()
)
