package com.medicalsystem.backend.service

import com.medicalsystem.backend.entity.RiskFlagEntity
import com.medicalsystem.backend.model.*
import com.medicalsystem.backend.repository.*
import org.slf4j.LoggerFactory
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

data class ClinicalRiskAssessmentResult(
    val riskStatus: RiskStatus,
    val flags: Set<RiskFlagName>,
    val phq9Score: Int,
    val gad7Score: Int,
    val isAcuteRisk: Boolean
)

@Service
class ClinicalRiskEvaluator(
    private val studentHealthProfileJpaRepository: StudentHealthProfileJpaRepository,
    private val studentJpaRepository: StudentJpaRepository,
    private val userJpaRepository: UserJpaRepository,
    private val notificationService: NotificationService
) {
    private val logger = LoggerFactory.getLogger(ClinicalRiskEvaluator::class.java)

    @Transactional
    fun evaluateRisk(
        studentId: Long,
        answers: Map<String, Any>,
        completedTests: List<PsychometricTest> = emptyList()
    ): ClinicalRiskAssessmentResult {
        val flags = mutableSetOf<RiskFlagName>()

        val ghq22 = answers["ghq_22"]?.toString()?.toIntOrNull() ?: -1
        val ghq23 = answers["ghq_23"]?.toString()?.toIntOrNull() ?: -1
        val phq99 = answers["phq9_9"]?.toString()?.toIntOrNull() ?: -1

        var isAcute = false

        // ghq_23: Suicidal ideation ("过去任何时候您是否想过自杀或故意伤害自己")
        // phq9_9 >= 1: Thoughts of hurting oneself
        if (ghq23 == 1 || phq99 >= 1) {
            flags.add(RiskFlagName.SUICIDAL_IDEATION)
            isAcute = true
        }

        // ghq_22: Suicide attempt history ("过去任何时候您是否有过喝药、割腕等自伤或自杀行为")
        if (ghq22 == 1) {
            flags.add(RiskFlagName.SUICIDE_ATTEMPT)
            isAcute = true
        }

        // NSSI options: 1 = "0次", 2 = "1~2次", 3 = "3~5次", 4 = "6次及以上"
        val hasSelfHarm = (1..5).any { i ->
            (answers["nssi_$i"]?.toString()?.toIntOrNull() ?: 1) >= 2
        }
        if (hasSelfHarm) {
            flags.add(RiskFlagName.SELF_HARM)
        }

        val phq9Score = calculateSum(answers, "phq9_", 1..9)
        val gad7Score = calculateSum(answers, "gad7_", 1..7)

        val evaluatedRisk: RiskStatus = when {
            isAcute -> RiskStatus.HIGH
            phq9Score >= 15 || gad7Score >= 15 -> RiskStatus.HIGH
            phq9Score >= 10 || gad7Score >= 10 -> RiskStatus.MEDIUM
            else -> RiskStatus.LOW
        }

        val profileOpt = studentHealthProfileJpaRepository.findByStudentId(studentId)
        if (profileOpt.isPresent) {
            val profile = profileOpt.get()
            val currentLevel = riskPriority(profile.riskStatus)
            val evaluatedLevel = riskPriority(evaluatedRisk)
            if (evaluatedLevel > currentLevel) {
                profile.riskStatus = evaluatedRisk
            }

            val existingFlagNames = profile.riskFlags.map { it.name }.toSet()
            for (flagName in flags) {
                if (!existingFlagNames.contains(flagName)) {
                    profile.riskFlags.add(
                        RiskFlagEntity(
                            name = flagName,
                            status = FlagStatus.POSITIVE,
                            healthProfile = profile
                        )
                    )
                }
            }
            studentHealthProfileJpaRepository.save(profile)
        }

        if (evaluatedRisk == RiskStatus.HIGH) {
            val studentName = studentJpaRepository.findById(studentId).orElse(null)?.name ?: "学生"
            val headCouncillors = userJpaRepository.findAll().filter { it.role == UserRole.HEAD_COUNSELLOR }
            for (hc in headCouncillors) {
                try {
                    notificationService.createNotification(
                        userId = hc.id,
                        messageCode = NotificationMessageCode.ASSESSMENT_HIGH_RISK_ALERT_HC,
                        payload = mapOf(
                            "studentId" to studentId.toString(),
                            "studentName" to studentName,
                            "crisisFlags" to flags.joinToString { it.name },
                            "level" to "HIGH"
                        ),
                        actionType = NotificationActionType.VIEW_RECORDS,
                        actionTargetId = studentId
                    )
                } catch (e: Exception) {
                    logger.error("Failed to notify Head Councillor ${hc.id}: ${e.message}")
                }
            }
        }

        return ClinicalRiskAssessmentResult(
            riskStatus = evaluatedRisk,
            flags = flags,
            phq9Score = phq9Score,
            gad7Score = gad7Score,
            isAcuteRisk = isAcute
        )
    }

    private fun calculateSum(answers: Map<String, Any>, prefix: String, range: IntRange): Int {
        var sum = 0
        for (i in range) {
            val v = answers["$prefix$i"]?.toString()?.toIntOrNull() ?: 0
            sum += v
        }
        return sum
    }

    private fun riskPriority(status: RiskStatus): Int = when (status) {
        RiskStatus.HIGH -> 3
        RiskStatus.MEDIUM -> 2
        RiskStatus.LOW -> 1
    }
}
