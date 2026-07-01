package com.medicalsystem.backend.service

import com.medicalsystem.backend.dto.CreateReferralDto
import com.medicalsystem.backend.dto.ReferralDto
import com.medicalsystem.backend.dto.ReferralTrackingDto
import com.medicalsystem.backend.entity.ReferralEntity
import com.medicalsystem.backend.model.ReferralStatus
import com.medicalsystem.backend.mapper.ReferralMapper
import com.medicalsystem.backend.repository.ReferralRepository
import com.medicalsystem.backend.repository.StudentRepository
import com.medicalsystem.backend.exception.ResourceNotFoundException
import com.medicalsystem.backend.model.ReferralType
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.time.LocalDateTime

@Service
@Transactional(readOnly = true)
class ReferralService(
    private val referralRepository: ReferralRepository,
    private val studentRepository: StudentRepository,
    private val referralMapper: ReferralMapper
) {
    companion object {
        const val SYSTEM_USER = "SYSTEM"
        const val ACTION_DRAFT = "draft"
    }

    fun getAllReferrals(): List<ReferralDto> {
        return referralRepository.findAll()
            .map { referralMapper.toDto(it) }
    }

    fun getReferralById(id: Long): ReferralDto {
        val entity = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral not found with id: $id") }
        return referralMapper.toDto(entity)
    }

    fun getReferralTracking(id: Long): ReferralTrackingDto {
        val entity = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral not found with id: $id") }
        
        return referralMapper.toTrackingDto(entity)
    }

    @Transactional
    fun createReferral(dto: CreateReferralDto): ReferralDto {
        val student = studentRepository.findById(dto.studentId)
            .orElseThrow { ResourceNotFoundException("Student not found with id: ${dto.studentId}") }

        val status = if (dto.actionType == ACTION_DRAFT) {
            ReferralStatus.DRAFT
        } else {
            ReferralStatus.AWAITING_APPROVAL
        }

        val entity = ReferralEntity(
            student = student,
            type = ReferralType.INITIAL,
            title = dto.title,
            description = dto.reason,
            riskLevel = dto.riskLevel,
            status = status,
            referredByName = SYSTEM_USER,
            createdAt = LocalDateTime.now()
        )

        val saved = referralRepository.save(entity)
        return referralMapper.toDto(saved)
    }
}

