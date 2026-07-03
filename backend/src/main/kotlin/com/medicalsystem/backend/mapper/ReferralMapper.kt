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
                    title = it.title,
                    subtitle = it.subtitle,
                    time = it.time,
                    status = it.status,
                    actorId = it.actorId
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
        }.toMutableList()

        entity.steps = model.steps.map {
            ReferralStepEntity(
                id = it.id ?: 0,
                referral = entity,
                type = it.type,
                title = it.title,
                subtitle = it.subtitle,
                time = it.time,
                status = it.status,
                actorId = it.actorId
            )
        }.toMutableList()

        return entity
    }

    fun toDto(model: Referral): ReferralDto {
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
            referredBy = ReferredByDto(user?.name ?: "Unknown")
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

        val mappedSteps = model.steps.map { step ->
            com.medicalsystem.backend.dto.ReferralStepDto(
                id = step.id.toString(),
                type = step.type.toValue(),
                title = step.title,
                subtitle = step.subtitle,
                time = step.time.toString(),
                status = step.status.toValue()
            )
        }.toMutableList()

        if (model.status != com.medicalsystem.backend.model.ReferralStatus.REJECTED && 
            model.status != com.medicalsystem.backend.model.ReferralStatus.RECALLED && 
            model.status != com.medicalsystem.backend.model.ReferralStatus.CLOSED) {
            
            val standardSequence = listOf(
                com.medicalsystem.backend.model.ReferralStepType.INITIATION to "发起转诊",
                com.medicalsystem.backend.model.ReferralStepType.REVIEW to "转诊审核",
                com.medicalsystem.backend.model.ReferralStepType.TRIAGE to "分诊评估",
                com.medicalsystem.backend.model.ReferralStepType.SCHEDULING to "预约安排",
                com.medicalsystem.backend.model.ReferralStepType.EVALUATION to "医生评估",
                com.medicalsystem.backend.model.ReferralStepType.FEEDBACK to "反馈跟进"
            )

            val lastActualStepType = model.steps.lastOrNull()?.type
            val nextIndex = if (lastActualStepType != null) {
                standardSequence.indexOfFirst { it.first == lastActualStepType } + 1
            } else 0

            if (nextIndex in 1 until standardSequence.size) {
                for (i in nextIndex until standardSequence.size) {
                    mappedSteps.add(
                        com.medicalsystem.backend.dto.ReferralStepDto(
                            id = "pending_$i",
                            type = standardSequence[i].first.toValue(),
                            title = standardSequence[i].second,
                            subtitle = "等待进行",
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
