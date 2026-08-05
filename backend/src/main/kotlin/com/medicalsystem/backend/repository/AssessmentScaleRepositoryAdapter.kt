package com.medicalsystem.backend.repository

import com.medicalsystem.backend.config.AssessmentCatalogLoader
import com.medicalsystem.backend.model.AssessmentScale
import com.medicalsystem.backend.model.AssessmentScaleRepository
import jakarta.annotation.PostConstruct
import org.springframework.stereotype.Repository
import java.util.Optional

@Repository
class AssessmentScaleRepositoryAdapter(
    private val catalogLoader: AssessmentCatalogLoader
) : AssessmentScaleRepository {

    private lateinit var scalesCache: Map<String, AssessmentScale>

    @PostConstruct
    fun init() {
        scalesCache = catalogLoader.loadCatalog()
    }

    override fun findByBatteryCode(batteryCode: String): Optional<AssessmentScale> {
        return Optional.ofNullable(scalesCache[batteryCode])
    }

    override fun findAll(): List<AssessmentScale> {
        return scalesCache.values.toList()
    }

    override fun save(scale: AssessmentScale): AssessmentScale {
        throw UnsupportedOperationException("Saving assessment scales is not supported in the static JSON catalog.")
    }

    override fun count(): Long {
        return scalesCache.size.toLong()
    }

    override fun deleteAll() {
        throw UnsupportedOperationException("Deleting assessment scales is not supported in the static JSON catalog.")
    }
}
