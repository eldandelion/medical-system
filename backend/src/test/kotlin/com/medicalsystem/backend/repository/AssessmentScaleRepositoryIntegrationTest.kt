package com.medicalsystem.backend.repository

import com.medicalsystem.backend.config.AssessmentDataInitializer
import com.medicalsystem.backend.model.AssessmentScaleRepository
import com.medicalsystem.backend.model.AssessmentScaleType
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.transaction.annotation.Transactional

@SpringBootTest
@Transactional
class AssessmentScaleRepositoryIntegrationTest {

    @Autowired
    private lateinit var scaleRepository: AssessmentScaleRepository

    @Autowired
    private lateinit var dataInitializer: AssessmentDataInitializer

    @Test
    fun `data initializer seeds scales and repository loads full aggregate`() {
        dataInitializer.initialize()

        val allScales = scaleRepository.findAll()
        assertFalse(allScales.isEmpty(), "Should have seeded scales")
        assertTrue(allScales.size >= 8, "Expected at least 8 seeded assessment scales")

        val phq9 = scaleRepository.findByScaleType(AssessmentScaleType.PHQ_9).orElse(null)
        assertNotNull(phq9)
        assertEquals("PHQ-9 抑郁症筛查量表", phq9.title)
        assertEquals(1, phq9.sections.size)
        assertEquals(9, phq9.totalQuestions)
        assertEquals(9, phq9.allQuestionCodes.size)

        // Check options loaded
        val q1 = phq9.sections[0].questions[0]
        assertEquals("phq9_1", q1.code)
        assertEquals(4, q1.effectiveOptions.size)
        assertEquals(0, q1.effectiveOptions[0].value)
        assertEquals("完全不会", q1.effectiveOptions[0].label)

        // Check APQ-9 scales present
        val apqFather = scaleRepository.findByScaleType(AssessmentScaleType.APQ_9_FATHER).orElse(null)
        assertNotNull(apqFather)
        assertEquals(9, apqFather.totalQuestions)

        val apqMother = scaleRepository.findByScaleType(AssessmentScaleType.APQ_9_MOTHER).orElse(null)
        assertNotNull(apqMother)
        assertEquals(9, apqMother.totalQuestions)

        // Check SCL-90
        val scl90 = scaleRepository.findByScaleType(AssessmentScaleType.SCL_90).orElse(null)
        assertNotNull(scl90)
        assertEquals(90, scl90.totalQuestions)
    }
}
