package com.medicalsystem.backend.config

import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class AssessmentCatalogLoaderTest {

    private lateinit var catalogLoader: AssessmentCatalogLoader

    @BeforeEach
    fun setUp() {
        catalogLoader = AssessmentCatalogLoader()
        catalogLoader.init()
    }

    @Test
    fun testLoadComprehensiveSurvey_Success() {
        val catalog = catalogLoader.loadCatalog()

        assertFalse(catalog.isEmpty(), "Catalog should not be empty")
        
        val survey = catalog["comprehensive_student_intake_survey"]
        assertNotNull(survey, "comprehensive_student_intake_survey must exist in catalog")
        assertEquals("中南大学学生心身健康综合调查问卷", survey?.title)
        assertEquals(45, survey?.estimatedMinutes)
        assertFalse(survey?.sections.isNullOrEmpty())
    }

    @Test
    fun testTotalQuestionCountEquals377() {
        val survey = catalogLoader.getScaleDetail("comprehensive_student_intake_survey")
        assertNotNull(survey)
        survey!!

        assertEquals(377, survey.totalQuestions, "Total questions across all 30 subscales must be exactly 377")
        assertEquals(377, survey.questions.size)

        // Contiguous 1..377 ordering
        for (i in survey.questions.indices) {
            assertEquals(i + 1, survey.questions[i].orderNum, "Question at index $i must have orderNum ${i + 1}")
        }
    }

    @Test
    fun testPolymorphicQuestions() {
        val survey = catalogLoader.getScaleDetail("comprehensive_student_intake_survey")
        assertNotNull(survey)
        survey!!

        // 1. Text question (demo_name)
        val nameQ = survey.questions.first { it.code == "demo_name" }
        assertEquals("text", nameQ.type)
        assertEquals("fullName", nameQ.field)
        assertEquals("请输入真实姓名", nameQ.placeholder)

        // 2. Numeric question with unit (G1b_height)
        val heightQ = survey.questions.first { it.code == "G1b_height" }
        assertEquals("number", heightQ.type)
        assertEquals("cm", heightQ.unit)

        // 3. Slider question (G14_1)
        val sliderQ = survey.questions.first { it.code == "G14_1" }
        assertEquals("slider", sliderQ.type)
        assertEquals(1.0, sliderQ.min)
        assertEquals(10.0, sliderQ.max)

        // 4. Option with text input (G7 religion "other")
        val religionQ = survey.questions.first { it.code == "G7" }
        val otherOpt = religionQ.effectiveOptions.first { it.value == "other" }
        assertTrue(otherOpt.hasTextInput)

        // 5. High-risk suicide triage question (ghq_22)
        val suicideQ = survey.questions.first { it.code == "ghq_22" }
        assertEquals("single_choice", suicideQ.type)
        assertEquals(2, suicideQ.effectiveOptions.size)
    }

    @Test
    fun testOptionGroupResolution() {
        val survey = catalogLoader.getScaleDetail("comprehensive_student_intake_survey")
        assertNotNull(survey)
        survey!!

        val phq1 = survey.questions.first { it.code == "phq9_1" }
        assertNotNull(phq1.optionGroup)
        assertEquals("FOUR_POINT_FREQUENCY", phq1.optionGroup?.name)
        assertEquals(4, phq1.effectiveOptions.size)
        assertEquals(0, phq1.effectiveOptions[0].value)
        assertEquals("完全不会", phq1.effectiveOptions[0].label)
    }

    @Test
    fun testReverseIndexLookup() {
        assertEquals("demographics_survey", catalogLoader.lookupScaleCodeForQuestion("demo_name"))
        assertEquals("demographics_survey", catalogLoader.lookupScaleCodeForQuestion("G1"))
        assertEquals("general_health_screener", catalogLoader.lookupScaleCodeForQuestion("ghq_1"))
        assertEquals("general_health_screener", catalogLoader.lookupScaleCodeForQuestion("ghq_22"))
        assertEquals("phq_9", catalogLoader.lookupScaleCodeForQuestion("phq9_1"))
        assertEquals("gad_7", catalogLoader.lookupScaleCodeForQuestion("gad7_1"))
        assertEquals("big_five", catalogLoader.lookupScaleCodeForQuestion("big_five_1"))

        // Purged scales
        assertNull(catalogLoader.lookupScaleCodeForQuestion("scl90_1"))
        assertNull(catalogLoader.lookupScaleCodeForQuestion("psqi_1"))
    }
}
