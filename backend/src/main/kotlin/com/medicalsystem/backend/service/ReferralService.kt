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
import org.slf4j.LoggerFactory
import com.medicalsystem.backend.repository.UserRepository
import com.medicalsystem.backend.exception.ValidationException

@Service
@Transactional(readOnly = true)
class ReferralService(
    private val referralRepository: ReferralRepository,
    private val studentRepository: StudentRepository,
    private val userRepository: UserRepository,
    private val referralMapper: ReferralMapper
) {
    private val logger = LoggerFactory.getLogger(ReferralService::class.java)

    companion object {
        const val ACTION_DRAFT = "draft"
    }

    fun getAllReferrals(): List<ReferralDto> {
        return referralRepository.findAll()
            .map { referralMapper.toModel(it) }
            .map { referralMapper.toDto(it) }
    }

    fun getReferralById(id: Long): ReferralDto {
        val entity = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        return referralMapper.toDto(referralMapper.toModel(entity))
    }

    fun getReferralTracking(id: Long): ReferralTrackingDto {
        val entity = referralRepository.findById(id)
            .orElseThrow { ResourceNotFoundException("Referral with ID $id not found") }
        
        return referralMapper.toTrackingDto(entity)
    }

    @Transactional
    fun createReferral(dto: CreateReferralDto, token: String? = null): ReferralDto {
        val student = studentRepository.findById(dto.studentId)
            .orElseThrow { ResourceNotFoundException("Student with id ${dto.studentId} not found") }

        // In a real application, token parsing and identity resolution happens in a security filter.
        // Here we mock identity resolution.
        val user = if (token?.contains("teacher_token_zhang") == true) {
            userRepository.findByName("艾米丽·沃森") 
                ?: throw ValidationException("Authorized user not found in database")
        } else {
            userRepository.findAll().firstOrNull()
                ?: throw ValidationException("No user found in database for fallback")
        }

        val entity = ReferralEntity(
            student = student,
            type = com.medicalsystem.backend.model.ReferralType.INITIAL,
            title = dto.title,
            description = dto.reason,
            riskLevel = dto.riskLevel,
            status = com.medicalsystem.backend.model.ReferralStatus.DRAFT,
            referredBy = user,
            createdAt = LocalDateTime.now(),
            clinicalStatus = dto.clinicalStatus.toMutableList(),
            severeRiskFactors = dto.severeRiskFactors.toMutableList()
        )

        dto.attachments.forEach { attachmentDto ->
            val attachmentEntity = com.medicalsystem.backend.entity.AttachmentEntity(
                name = attachmentDto.name,
                size = attachmentDto.size,
                referral = entity
            )
            entity.attachments.add(attachmentEntity)
        }

        if (dto.actionType != ACTION_DRAFT) {
            entity.transition(
                newStatus = ReferralStatus.AWAITING_APPROVAL,
                title = "发起转诊",
                subtitle = "由辅导员提交",
                actor = null
            )
        }

        val saved = referralRepository.save(entity)
        return referralMapper.toDto(saved)
    }
}

