package com.medicalsystem.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.medicalsystem.backend.config.AssessmentCatalogLoader
import com.medicalsystem.backend.controller.AssessmentController
import com.medicalsystem.backend.dto.SaveDraftRequest
import com.medicalsystem.backend.dto.SubmitAssessmentRequest
import com.medicalsystem.backend.entity.*
import com.medicalsystem.backend.exception.GlobalExceptionHandler
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.core.MethodParameter
import org.springframework.http.MediaType
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.support.WebDataBinderFactory
import org.springframework.web.context.request.NativeWebRequest
import org.springframework.web.method.support.HandlerMethodArgumentResolver
import org.springframework.web.method.support.ModelAndViewContainer
import java.time.LocalDate
import java.time.LocalDateTime

@SpringBootTest
@Transactional
class AssessmentDraftIntegrationTest {

    @Autowired
    private lateinit var assessmentController: AssessmentController

    @Autowired
    private lateinit var userJpaRepository: UserJpaRepository

    @Autowired
    private lateinit var studentJpaRepository: StudentJpaRepository

    @Autowired
    private lateinit var majorJpaRepository: MajorJpaRepository

    @Autowired
    private lateinit var collegeJpaRepository: CollegeJpaRepository

    @Autowired
    private lateinit var assessmentAssignmentJpaRepository: AssessmentAssignmentJpaRepository

    @Autowired
    private lateinit var scaleDraftJpaRepository: ScaleDraftJpaRepository

    @Autowired
    private lateinit var studentHealthProfileJpaRepository: StudentHealthProfileJpaRepository

    @Autowired
    private lateinit var catalogLoader: AssessmentCatalogLoader

    private lateinit var mockMvc: MockMvc
    private val objectMapper = ObjectMapper()

    private lateinit var studentUser: UserEntity
    private lateinit var studentEntity: StudentEntity
    private lateinit var assignmentEntity: AssessmentAssignmentEntity

    @BeforeEach
    fun setUp() {
        val college = collegeJpaRepository.findAll().firstOrNull() ?: collegeJpaRepository.save(CollegeEntity(name = "计算机学院"))
        val major = majorJpaRepository.findAll().firstOrNull() ?: majorJpaRepository.save(MajorEntity(name = "计算机科学", college = college))

        studentUser = userJpaRepository.save(
            UserEntity(
                name = "测试学生",
                role = UserRole.STUDENT,
                email = EmailAddress("draft_student_${System.currentTimeMillis()}@univ.edu.cn"),
                status = AccountStatus.ACTIVE,
                phone = "13800009999"
            )
        )

        studentEntity = studentJpaRepository.save(
            StudentEntity(
                id = studentUser.id,
                studentNumber = "STU_DRAFT_001",
                name = "测试学生",
                major = major,
                enrollmentDate = LocalDate.now()
            )
        )

        studentHealthProfileJpaRepository.save(
            StudentHealthProfileEntity(
                studentId = studentUser.id,
                riskStatus = RiskStatus.LOW
            )
        )

        assignmentEntity = assessmentAssignmentJpaRepository.save(
            AssessmentAssignmentEntity(
                student = studentEntity,
                assignedByUser = studentUser,
                batteryCode = "comprehensive_student_intake_survey",
                status = AssessmentStatus.PENDING,
                assignedAt = LocalDateTime.now()
            )
        )

        val userModel = User(
            id = studentUser.id,
            name = studentUser.name,
            email = studentUser.email,
            role = studentUser.role,
            status = studentUser.status,
            phone = studentUser.phone
        )

        val argumentResolver = object : HandlerMethodArgumentResolver {
            override fun supportsParameter(parameter: MethodParameter): Boolean {
                return parameter.hasParameterAnnotation(com.medicalsystem.backend.security.CurrentUser::class.java)
            }

            override fun resolveArgument(
                parameter: MethodParameter,
                mavContainer: ModelAndViewContainer?,
                webRequest: NativeWebRequest,
                binderFactory: WebDataBinderFactory?
            ): Any? = userModel
        }

        mockMvc = MockMvcBuilders.standaloneSetup(assessmentController)
            .setCustomArgumentResolvers(argumentResolver)
            .setControllerAdvice(GlobalExceptionHandler())
            .build()
    }

    @Test
    fun `testPutDraft_SavesAndUpdatesProgress`() {
        val draftReq = SaveDraftRequest(
            answers = mapOf(
                "demo_name" to "李四",
                "demo_phone" to "13800009999",
                "phq9_1" to 1
            ),
            updatedAt = 1700000000000L
        )

        mockMvc.perform(
            put("/api/assessments/${assignmentEntity.id}/draft")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(draftReq))
        ).andExpect(status().isOk)

        // Verify draft saved in DB
        val draftOpt = scaleDraftJpaRepository.findByStudentIdAndScaleCode(studentUser.id, "comprehensive_student_intake_survey")
        assertTrue(draftOpt.isPresent)
        assertEquals(1700000000000L, draftOpt.get().clientUpdatedAt)
        assertTrue(draftOpt.get().answersJson.contains("demo_name"))

        // Verify assignment in-progress answers updated
        val updatedAssignment = assessmentAssignmentJpaRepository.findById(assignmentEntity.id!!).get()
        assertNotNull(updatedAssignment.answersJson)
        assertTrue(updatedAssignment.answersJson!!.contains("demo_name"))
    }

    @Test
    fun `testGetDraft_HydratesAnswers`() {
        scaleDraftJpaRepository.save(
            ScaleDraftEntity(
                studentId = studentUser.id,
                scaleCode = "comprehensive_student_intake_survey",
                answersJson = """{"demo_name":"王五","G1":"1"}""",
                clientUpdatedAt = 1700000005000L
            )
        )

        mockMvc.perform(
            get("/api/assessments/${assignmentEntity.id}/draft")
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.scaleCode").value("comprehensive_student_intake_survey"))
            .andExpect(jsonPath("$.answers.demo_name").value("王五"))
            .andExpect(jsonPath("$.answers.G1").value("1"))
            .andExpect(jsonPath("$.updatedAt").value(1700000005000L))
    }

    @Test
    fun `testSubmitSurvey_PurgesDraftAndProjectsDemographics`() {
        // Save initial draft
        scaleDraftJpaRepository.save(
            ScaleDraftEntity(
                studentId = studentUser.id,
                scaleCode = "comprehensive_student_intake_survey",
                answersJson = """{"demo_name":"张三"}""",
                clientUpdatedAt = 1700000000000L
            )
        )

        val allQuestions = catalogLoader.getScaleDetail("comprehensive_student_intake_survey")?.questions ?: emptyList()
        val completeAnswers = mutableMapOf<String, Any>()
        for (q in allQuestions) {
            completeAnswers[q.code] = when (q.type) {
                "text" -> "测试内容"
                "date" -> "2004-05-12"
                "number" -> 175.0
                "slider" -> 5.0
                else -> 0
            }
        }
        // Set demographic fields
        completeAnswers["demo_id_card"] = "110101200405125555"
        completeAnswers["G1"] = "1"
        completeAnswers["G6"] = 1

        val submitReq = SubmitAssessmentRequest(answers = completeAnswers)

        mockMvc.perform(
            post("/api/assessments/${assignmentEntity.id}/submit")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(submitReq))
        )
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.success").value(true))
            .andExpect(jsonPath("$.totalQuestionsAnswered").value(377))

        // Verify assignment status is COMPLETED
        val completedAssignment = assessmentAssignmentJpaRepository.findById(assignmentEntity.id!!).get()
        assertEquals(AssessmentStatus.COMPLETED, completedAssignment.status)

        // Verify draft was purged
        val draftOpt = scaleDraftJpaRepository.findByStudentIdAndScaleCode(studentUser.id, "comprehensive_student_intake_survey")
        assertFalse(draftOpt.isPresent, "Draft must be deleted upon submission")

        // Verify demographics projection
        val student = studentJpaRepository.findById(studentUser.id).get()
        assertNotNull(student.demographics)
        assertEquals(Gender.MALE, student.demographics?.gender)
        assertEquals("110101200405125555", student.demographics?.idCardNumber)
        assertEquals(LocalDate.of(2004, 5, 12), student.demographics?.dateOfBirth)
        assertEquals("城市", student.demographics?.homeAddress)
    }

    @Test
    fun `testRecordProgress_SynchronizesToScaleDrafts`() {
        val progressReq = com.medicalsystem.backend.dto.RecordProgressRequest(
            answers = mapOf(
                "demo_name" to "赵六",
                "phq9_1" to 2
            )
        )

        mockMvc.perform(
            put("/api/assessments/${assignmentEntity.id}/progress")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(progressReq))
        ).andExpect(status().isOk)

        val draftOpt = scaleDraftJpaRepository.findByStudentIdAndScaleCode(studentUser.id, "comprehensive_student_intake_survey")
        assertTrue(draftOpt.isPresent)
        assertTrue(draftOpt.get().answersJson.contains("赵六"))
    }
}
