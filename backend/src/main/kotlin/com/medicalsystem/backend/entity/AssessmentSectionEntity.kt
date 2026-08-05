package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "assessment_sections")
class AssessmentSectionEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scale_id", nullable = false)
    var scale: AssessmentScaleEntity? = null,

    @Column(nullable = false)
    var code: String,

    @Column(nullable = false)
    var title: String,

    @Column
    var subtitle: String? = null,

    @Column(length = 1000)
    var description: String? = null,

    @Column(name = "order_num", nullable = false)
    var orderNum: Int = 0,

    @OneToMany(mappedBy = "section", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("orderNum ASC")
    var questions: MutableSet<AssessmentQuestionEntity> = mutableSetOf()
)
