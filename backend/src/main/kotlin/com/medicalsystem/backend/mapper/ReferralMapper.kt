package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.ReferredByDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.entity.AttachmentEntity
import com.medicalsystem.backend.entity.ReferralDestination
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.entity.ReferralStepEntity
import com.medicalsystem.backend.model.Attachment
import com.medicalsystem.backend.model.Referral
import com.medicalsystem.backend.model.ReferralStep
import org.springframework.stereotype.Component

import com.medicalsystem.backend.repository.*

@Component
class ReferralMapper(
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val hospitalRepository: HospitalRepository,
    private val departmentRepository: DepartmentRepository,
    private val doctorRepository: DoctorRepository,
    private val trialAdminRepository: TrialAdminJpaRepository
) {

    fun toModel(entity: ReferralEntity): Referral {
        return Referral(
            id = entity.id,
            studentId = entity.studentId,
            type = entity.type,
            date = entity.createdAt,
            title = entity.title,
            description = entity.description,
            riskLevel = entity.riskLevel,
            status = entity.status,
            referredById = entity.referredById,
            clinicalStatus = entity.clinicalStatus.toMutableList(),
            severeRiskFactors = entity.severeRiskFactors.toMutableList(),
            destination = entity.destination?.let { dest ->
                com.medicalsystem.backend.model.ReferralDestination(
                    hospitalId = dest.hospital?.id,
                    departmentId = dest.department?.id,
                    doctorId = dest.doctor?.id,
                    triageAdminId = dest.triageAdmin?.id,
                    transferDate = dest.transferDate,
                    appointmentTime = dest.appointmentTime
                )
            },
            attachments = entity.attachments.map {
                Attachment(
                    id = it.id,
                    name = it.name,
                    size = it.size
                )
            }.toMutableList(),
            steps = entity.steps.map {
                ReferralStep(
                    id = it.id,
                    type = it.type,
                    time = it.time,
                    status = it.status,
                    actorId = it.actorId,
                    reason = it.reason
                )
            }.toMutableList()
        )
    }

    fun toEntity(model: Referral): ReferralEntity {
        val entity = ReferralEntity(
            id = model.id,
            studentId = model.studentId,
            type = model.type,
            title = model.title,
            description = model.description,
            riskLevel = model.riskLevel,
            status = model.status,
            referredById = model.referredById,
            createdAt = model.date,
            clinicalStatus = model.clinicalStatus.toMutableList(),
            severeRiskFactors = model.severeRiskFactors.toMutableList()
        )

        entity.destination = model.destination?.let { dest ->
            ReferralDestination(
                hospital = dest.hospitalId?.let { hospitalRepository.findById(it).orElse(null) },
                department = dest.departmentId?.let { departmentRepository.findById(it).orElse(null) },
                doctor = dest.doctorId?.let { doctorRepository.findById(it).orElse(null) },
                triageAdmin = dest.triageAdminId?.let { trialAdminRepository.findById(it).orElse(null) },
                transferDate = dest.transferDate,
                appointmentTime = dest.appointmentTime
            )
        }

        entity.attachments = model.attachments.map {
            AttachmentEntity(
                id = it.id,
                name = it.name,
                size = it.size,
                referral = entity
            )
        }.toMutableSet()

        entity.steps = model.steps.map {
            ReferralStepEntity(
                id = it.id ?: 0,
                referral = entity,
                type = it.type,
                time = it.time,
                status = it.status,
                actorId = it.actorId,
                reason = it.reason
            )
        }.toMutableSet()

        return entity
    }

    fun toDto(model: Referral, currentUser: com.medicalsystem.backend.model.User? = null): ReferralDto {
        val student = studentRepository.findById(model.studentId).orElse(null)
        val user = userRepository.findById(model.referredById).orElse(null)
        return ReferralDto(
            id = model.id.toString(),
            studentName = student?.name ?: "Unknown",
            studentNumber = student?.studentNumber ?: "Unknown",
            type = model.type,
            date = model.date,
            title = model.title,
            description = model.description,
            riskLevel = model.riskLevel,
            status = model.status,
            referredBy = ReferredByDto(user?.name ?: "Unknown"),
            availableActions = currentUser?.let { model.getAllowedActions(it).map { action -> action.name.lowercase() } } ?: emptyList()
        )
    }

    fun toDetailsDto(model: Referral, currentUser: com.medicalsystem.backend.model.User? = null): com.medicalsystem.backend.dto.ReferralDetailsDto {
        val baseInfo = toDto(model, currentUser)
        val student = studentRepository.findById(model.studentId).orElse(null)
        
        val studentDemographics = com.medicalsystem.backend.dto.StudentDemographicsDto(
            studentId = student?.studentNumber ?: "Unknown",
            school = "未知学院",
            grade = "未知年级",
            phone = "未知电话",
            age = 20, // Default mock value since backend doesn't store this yet
            gender = "未知"
        )

        val triageInfo = com.medicalsystem.backend.dto.TriageInfoDto(
            isFirstVisit = model.clinicalStatus.contains(com.medicalsystem.backend.model.ClinicalStatusType.FIRST_VISIT),
            isMedicated = model.clinicalStatus.contains(com.medicalsystem.backend.model.ClinicalStatusType.MEDICATED),
            priorTherapy = if (model.clinicalStatus.contains(com.medicalsystem.backend.model.ClinicalStatusType.PRIOR_THERAPY)) "有" else "无",
            fullDescription = model.description
        )

        val riskAssessment = com.medicalsystem.backend.dto.RiskAssessmentDto(
            ideation = model.severeRiskFactors.contains(com.medicalsystem.backend.model.RiskFlagName.SUICIDAL_IDEATION),
            attempt = model.severeRiskFactors.contains(com.medicalsystem.backend.model.RiskFlagName.SUICIDE_ATTEMPT),
            selfHarm = model.severeRiskFactors.contains(com.medicalsystem.backend.model.RiskFlagName.SELF_HARM),
            notes = null
        )

        return com.medicalsystem.backend.dto.ReferralDetailsDto(
            baseInfo = baseInfo,
            studentDemographics = studentDemographics,
            triageInfo = triageInfo,
            riskAssessment = riskAssessment,
            feedback = null
        )
    }

    fun toTrackingDto(model: Referral): com.medicalsystem.backend.dto.ReferralTrackingDto {
        val dest = model.destination?.let { dest ->
            val hospital = dest.hospitalId?.let { hospitalRepository.findById(it).orElse(null) }
            val department = dest.departmentId?.let { departmentRepository.findById(it).orElse(null) }
            val doctor = dest.doctorId?.let { doctorRepository.findById(it).orElse(null) }
            val admin = dest.triageAdminId?.let { trialAdminRepository.findById(it).orElse(null) }
            
            com.medicalsystem.backend.dto.DestinationDto(
                hospital = hospital?.name ?: "",
                department = department?.name ?: "",
                doctor = doctor?.name ?: "",
                admin = admin?.name ?: "",
                transferDate = dest.transferDate?.toString(),
                appointmentTime = dest.appointmentTime?.toString()
            )
        }

        val standardSequence = listOf(
            com.medicalsystem.backend.model.ReferralStepType.INITIATION,
            com.medicalsystem.backend.model.ReferralStepType.REVIEW,
            com.medicalsystem.backend.model.ReferralStepType.TRIAGE,
            com.medicalsystem.backend.model.ReferralStepType.SCHEDULING,
            com.medicalsystem.backend.model.ReferralStepType.EVALUATION,
            com.medicalsystem.backend.model.ReferralStepType.FEEDBACK
        )

        val typeIndices = standardSequence.mapIndexed { index, type -> type to index }.toMap()

        val sortedModelSteps = model.steps.sortedWith(
            compareBy<com.medicalsystem.backend.model.ReferralStep> { typeIndices[it.type] ?: 999 }
                .thenBy { it.time }
        )

        val mappedSteps = sortedModelSteps.map { step ->
            com.medicalsystem.backend.dto.ReferralStepDto(
                id = step.id.toString(),
                type = step.type.toValue(),
                time = step.time.toString(),
                status = step.status.toValue(),
                reason = step.reason
            )
        }.toMutableList()

        if (model.status != com.medicalsystem.backend.model.ReferralStatus.REJECTED && 
            model.status != com.medicalsystem.backend.model.ReferralStatus.RECALLED && 
            model.status != com.medicalsystem.backend.model.ReferralStatus.CLOSED) {

            val lastActualStepType = sortedModelSteps.lastOrNull()?.type
            val nextIndex = if (lastActualStepType != null) {
                standardSequence.indexOf(lastActualStepType) + 1
            } else 0

            if (nextIndex in 1 until standardSequence.size) {
                for (i in nextIndex until standardSequence.size) {
                    mappedSteps.add(
                        com.medicalsystem.backend.dto.ReferralStepDto(
                            id = "pending_$i",
                            type = standardSequence[i].toValue(),
                            time = "",
                            status = "pending"
                        )
                    )
                }
            }
        }

        val steps = mappedSteps.ifEmpty { null }

        return com.medicalsystem.backend.dto.ReferralTrackingDto(
            destination = dest,
            steps = steps
        )
    }
}
