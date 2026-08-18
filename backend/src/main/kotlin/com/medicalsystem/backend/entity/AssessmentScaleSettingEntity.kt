package com.medicalsystem.backend.entity

import jakarta.persistence.Column
import jakarta.persistence.Entity
import jakarta.persistence.Id
import jakarta.persistence.Table
import java.time.Instant

@Entity
@Table(name = "assessment_scale_settings")
class AssessmentScaleSettingEntity(
    @Id
    val batteryCode: String,

    @Column(nullable = false)
    var isAvailable: Boolean = true,

    @Column(name = "updated_at", nullable = false)
    var updatedAt: Instant = Instant.now()
)
