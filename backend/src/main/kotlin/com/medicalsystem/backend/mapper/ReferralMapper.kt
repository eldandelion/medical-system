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

        val steps = entity.steps.map { step ->
            com.medicalsystem.backend.dto.ReferralStepDto(
                id = step.id.toString(),
                type = step.type.toValue(),
                title = step.title,
                subtitle = step.subtitle,
                time = step.time.toString(),
                status = step.status.toValue()
            )
        }.ifEmpty { null }

        return com.medicalsystem.backend.dto.ReferralTrackingDto(
            destination = dest,
            steps = steps
        )
    }
}
