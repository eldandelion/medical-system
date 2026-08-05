package com.medicalsystem.backend.entity

import jakarta.persistence.*

@Entity
@Table(name = "assessment_option_groups")
class AssessmentOptionGroupEntity(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Long? = null,

    @Column(nullable = false, unique = true)
    var name: String,

    @OneToMany(mappedBy = "optionGroup", cascade = [CascadeType.ALL], orphanRemoval = true, fetch = FetchType.LAZY)
    @OrderBy("value ASC")
    var options: MutableSet<AssessmentOptionEntity> = mutableSetOf()
)
