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
}
