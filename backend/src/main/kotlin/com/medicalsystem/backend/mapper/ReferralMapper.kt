package com.medicalsystem.backend.mapper

import com.medicalsystem.backend.dto.ReferredByDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.model.Referral
import org.springframework.stereotype.Component

@Component
class ReferralMapper {

    fun toModel(entity: ReferralEntity): Referral {
        return Referral(
            id = entity.id,
            studentName = entity.student.name,
            studentNumber = entity.student.studentNumber,
            type = entity.type,
            date = entity.createdAt,
            title = entity.title,
            description = entity.description,
            riskLevel = entity.riskLevel,
            status = entity.status,
            referredByName = entity.referredByName
        )
    }

    fun toDto(model: Referral): ReferralDto {
        return ReferralDto(
            id = model.id.toString(),
            studentName = model.studentName,
            studentNumber = model.studentNumber,
            type = model.type,
            date = model.date,
            title = model.title,
            description = model.description,
            riskLevel = model.riskLevel,
            status = model.status,
            referredBy = ReferredByDto(model.referredByName)
        )
    }

    fun toDto(entity: ReferralEntity): ReferralDto {
        return ReferralDto(
            id = entity.id.toString(),
            studentName = entity.student.name,
            studentNumber = entity.student.studentNumber,
            type = entity.type,
            date = entity.createdAt,
            title = entity.title,
            description = entity.description,
            riskLevel = entity.riskLevel,
            status = entity.status,
            referredBy = ReferredByDto(entity.referredByName)
        )
    }

    fun toTrackingDto(entity: ReferralEntity): com.medicalsystem.backend.dto.ReferralTrackingDto {
        val dest = entity.destination?.let { dest ->
            com.medicalsystem.backend.dto.DestinationDto(
                hospital = dest.hospital?.name ?: "",
                department = dest.department?.name ?: "",
                doctor = dest.doctor?.name ?: "",
                admin = dest.admin?.name ?: "",
                transferDate = dest.transferDate?.toString(),
                appointmentTime = dest.appointmentTime?.toString()
            )
        }

        val mappedSteps = entity.steps.map { step ->
            com.medicalsystem.backend.dto.ReferralStepDto(
                id = step.id.toString(),
                type = step.type.toValue(),
                title = step.title,
                subtitle = step.subtitle,
                time = step.time.toString(),
                status = step.status.toValue()
            )
        }.toMutableList()

        if (entity.status != com.medicalsystem.backend.model.ReferralStatus.REJECTED && 
            entity.status != com.medicalsystem.backend.model.ReferralStatus.RECALLED && 
            entity.status != com.medicalsystem.backend.model.ReferralStatus.CLOSED) {
            
            val standardSequence = listOf(
                com.medicalsystem.backend.model.ReferralStepType.INITIATION to "发起转诊",
                com.medicalsystem.backend.model.ReferralStepType.REVIEW to "转诊审核",
                com.medicalsystem.backend.model.ReferralStepType.TRIAGE to "分诊评估",
                com.medicalsystem.backend.model.ReferralStepType.SCHEDULING to "预约安排",
                com.medicalsystem.backend.model.ReferralStepType.EVALUATION to "医生评估",
                com.medicalsystem.backend.model.ReferralStepType.FEEDBACK to "反馈跟进"
            )

            val lastActualStepType = entity.steps.lastOrNull()?.type
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
