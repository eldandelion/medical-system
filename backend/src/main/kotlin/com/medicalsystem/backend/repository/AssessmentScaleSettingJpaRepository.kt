package com.medicalsystem.backend.repository

import com.medicalsystem.backend.entity.AssessmentScaleSettingEntity
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface AssessmentScaleSettingJpaRepository : JpaRepository<AssessmentScaleSettingEntity, String>
