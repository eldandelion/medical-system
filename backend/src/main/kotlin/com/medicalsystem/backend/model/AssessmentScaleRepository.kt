package com.medicalsystem.backend.model

import java.util.Optional

interface AssessmentScaleRepository {
    fun findByBatteryCode(batteryCode: String): Optional<AssessmentScale>
    fun findAll(): List<AssessmentScale>
    fun save(scale: AssessmentScale): AssessmentScale
    fun count(): Long
    fun deleteAll()
}
