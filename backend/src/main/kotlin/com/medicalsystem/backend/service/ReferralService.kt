package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferredByDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.entity.ReferralStatus
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class ReferralService(
    private val referralRepository: ReferralRepository,
    private val studentRepository: StudentRepository
) {
    fun getAllReferrals(): List<ReferralDto> {
        return referralRepository.findAll().map { toDto(it) }
    }

    fun getReferralById(id: Long): ReferralDto {
        val entity = referralRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Referral not found") }
        return toDto(entity)
    }

    fun createReferral(dto: CreateReferralDto): ReferralDto {
        val student = studentRepository.findById(dto.studentId)
            .orElseThrow { IllegalArgumentException("Student not found") }

        val status = if (dto.actionType == "draft") {
            ReferralStatus.DRAFT
        } else {
            ReferralStatus.AWAITING_APPROVAL
        }

        val entity = ReferralEntity(
            student = student,
            type = "初次转诊",
            title = dto.title,
            description = dto.reason,
            riskLevel = dto.riskLevel,
            status = status,
            referredByName = "SYSTEM", // Placeholder until auth is implemented
            createdAt = LocalDateTime.now()
        )

        val saved = referralRepository.save(entity)
        return toDto(saved)
    }

    private fun toDto(entity: ReferralEntity): ReferralDto {
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
}
