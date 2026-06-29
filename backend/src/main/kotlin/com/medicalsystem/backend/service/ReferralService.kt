package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.mapper.ReferralMapper
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.StudentRepository
import org.springframework.stereotype.Service
import java.time.LocalDateTime

@Service
class ReferralService(
    private val referralRepository: ReferralRepository,
    private val studentRepository: StudentRepository,
    private val referralMapper: ReferralMapper
) {
    fun getAllReferrals(): List<ReferralDto> {
        return referralRepository.findAll()
            .map { referralMapper.toModel(it) }
            .map { referralMapper.toDto(it) }
    }

    fun getReferralById(id: Long): ReferralDto {
        val entity = referralRepository.findById(id)
            .orElseThrow { IllegalArgumentException("Referral not found") }
        val model = referralMapper.toModel(entity)
        return referralMapper.toDto(model)
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
        val model = referralMapper.toModel(saved)
        return referralMapper.toDto(model)
    }
}

