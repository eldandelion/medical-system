package com.medicalsystem.backend.config

import com.fasterxml.jackson.databind.ObjectMapper
import com.medicalsystem.backend.exception.AssessmentCatalogInitializationException
import com.medicalsystem.backend.model.AssessmentScaleType
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows

class AssessmentCatalogLoaderTest {

    private lateinit var objectMapper: ObjectMapper
    private lateinit var catalogLoader: AssessmentCatalogLoader

    @BeforeEach
    fun setUp() {
        objectMapper = ObjectMapper()
        catalogLoader = AssessmentCatalogLoader()
    }

    @Test
    fun `loadCatalog should successfully parse all JSON files and return a map of scales`() {
        val catalog = catalogLoader.loadCatalog()

        assertFalse(catalog.isEmpty(), "Catalog should not be empty")
        
        // Assert that MENTAL_HEALTH_ASSESSMENT exists and is mapped properly
        val mentalHealthScale = catalog[AssessmentScaleType.MENTAL_HEALTH_ASSESSMENT]
        assertNotNull(mentalHealthScale)
        assertEquals("年度身心健康状况综合评估", mentalHealthScale?.title)
        
        // Assert sections are stitched correctly (e.g., phq_9 should be first in mental health)
        val firstSection = mentalHealthScale?.sections?.firstOrNull()
        assertNotNull(firstSection)
        assertEquals("phq_9", firstSection?.code)
        
        // Assert questions are populated
        val firstQuestion = firstSection?.questions?.firstOrNull()
        assertNotNull(firstQuestion)
        assertEquals("phq9_1", firstQuestion?.code)
        
        // Assert option groups are resolved correctly
        val optionGroup = firstQuestion?.optionGroup
        assertNotNull(optionGroup)
        assertEquals("FOUR_POINT_FREQUENCY", optionGroup?.name)
        assertFalse(optionGroup?.options.isNullOrEmpty())
    }

    // A more thorough failure test would require a custom resource resolver to inject bad files,
    // but verifying the happy path with production JSON files acts as a solid integration check.
}
